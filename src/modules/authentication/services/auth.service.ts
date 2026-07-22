import { auth, isBetterAuthError, mapBetterAuthError } from "@/core/auth";
import { AUTH_CONSTANTS } from "@/modules/authentication/constants/auth";
import type {
  ChangePasswordDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  SwitchClinicDto,
} from "@/modules/authentication/dto/auth.dto";
import {
  toAuthSession,
  toAuthUser,
  toUserStatus,
} from "@/modules/authentication/mappers/auth.mapper";
import { membershipRepository } from "@/modules/authentication/repositories/membership.repository";
import { permissionRepository } from "@/modules/authentication/repositories/permission.repository";
import { sessionRepository } from "@/modules/authentication/repositories/session.repository";
import { userRepository } from "@/modules/authentication/repositories/user.repository";
import type {
  AuthContext,
  AuthMembership,
  AuthSession,
  AuthUser,
} from "@/modules/authentication/types/auth";
import { assertUserCanAuthenticate } from "@/modules/authentication/utils/assert-user";
import type { AuthRequestContext } from "@/shared/auth";
import { AppError } from "@/shared/errors/app-error";
import { ErrorCode } from "@/shared/errors/codes";

type BaSessionResult = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

async function resolvePermissions(
  membership: AuthMembership | null,
): Promise<AuthContext["permissions"]> {
  if (!membership) return [];
  return permissionRepository.listKeysByRoleId(membership.roleId);
}

async function resolveMembership(
  userId: string,
  activeClinicId: string | null,
): Promise<AuthMembership | null> {
  if (activeClinicId) {
    return membershipRepository.findActiveByUserAndClinic(
      userId,
      activeClinicId,
    );
  }
  return membershipRepository.findDefaultByUser(userId);
}

async function ensureActiveClinic(
  session: AuthSession,
  membership: AuthMembership | null,
): Promise<{ session: AuthSession; membership: AuthMembership | null }> {
  if (session.activeClinicId || !membership) {
    return { session, membership };
  }

  const updated = await sessionRepository.updateActiveClinicId(
    session.id,
    membership.clinicId,
  );

  return {
    session: updated ?? { ...session, activeClinicId: membership.clinicId },
    membership,
  };
}

function mapBaUser(baUser: BaSessionResult["user"]): AuthUser {
  return toAuthUser({
    id: baUser.id,
    name: baUser.name,
    email: baUser.email,
    emailVerified: baUser.emailVerified,
    image: baUser.image ?? null,
    phone: (baUser as { phone?: string | null }).phone ?? null,
    status: toUserStatus((baUser as { status?: unknown }).status),
  });
}

function mapBaSession(baSession: BaSessionResult["session"]): AuthSession {
  return toAuthSession({
    id: baSession.id,
    userId: baSession.userId,
    token: baSession.token,
    expiresAt: baSession.expiresAt,
    activeClinicId:
      (baSession as { activeClinicId?: string | null }).activeClinicId ?? null,
  });
}

async function buildAuthContext(ba: BaSessionResult): Promise<AuthContext> {
  const user = mapBaUser(ba.user);
  assertUserCanAuthenticate(user);

  let session = mapBaSession(ba.session);
  let membership = await resolveMembership(user.id, session.activeClinicId);

  const ensured = await ensureActiveClinic(session, membership);
  session = ensured.session;
  membership = ensured.membership;

  // Stale activeClinicId (removed membership) → clear and fall back to default
  if (session.activeClinicId && !membership) {
    const fallback = await membershipRepository.findDefaultByUser(user.id);
    const updated = await sessionRepository.updateActiveClinicId(
      session.id,
      fallback?.clinicId ?? null,
    );
    session = updated ?? {
      ...session,
      activeClinicId: fallback?.clinicId ?? null,
    };
    membership = fallback;
  }

  const permissions = await resolvePermissions(membership);

  return { user, session, membership, permissions };
}

async function loadDomainUser(userId: string): Promise<AuthUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(ErrorCode.UNAUTHORIZED);
  }
  assertUserCanAuthenticate(user);
  return user;
}

export const authService = {
  async signUp(data: SignUpDto, ctx: AuthRequestContext): Promise<AuthContext> {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          ...(data.phone ? { phone: data.phone } : {}),
        },
        headers: ctx.headers,
      });

      if (!result?.user) {
        throw new AppError(ErrorCode.INTERNAL_ERROR);
      }

      const session = await auth.api.getSession({ headers: ctx.headers });
      if (!session) {
        throw new AppError(ErrorCode.UNAUTHORIZED);
      }

      return buildAuthContext(session);
    } catch (error) {
      mapBetterAuthError(error);
    }
  },

  async signIn(data: SignInDto, ctx: AuthRequestContext): Promise<AuthContext> {
    try {
      await auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
        },
        headers: ctx.headers,
      });

      const session = await auth.api.getSession({ headers: ctx.headers });
      if (!session) {
        throw new AppError(ErrorCode.INVALID_CREDENTIALS);
      }

      const user = await loadDomainUser(session.user.id);
      await userRepository.updateLastLoginAt(user.id);

      return buildAuthContext(session);
    } catch (error) {
      if (error instanceof AppError) throw error;
      mapBetterAuthError(error);
    }
  },

  async signOut(ctx: AuthRequestContext): Promise<void> {
    try {
      await auth.api.signOut({ headers: ctx.headers });
    } catch (error) {
      mapBetterAuthError(error);
    }
  },

  async getSession(ctx: AuthRequestContext): Promise<AuthContext | null> {
    const session = await auth.api.getSession({ headers: ctx.headers });
    if (!session) return null;

    try {
      return await buildAuthContext(session);
    } catch (error) {
      if (
        error instanceof AppError &&
        (error.code === ErrorCode.USER_INACTIVE ||
          error.code === ErrorCode.USER_SUSPENDED)
      ) {
        await auth.api.signOut({ headers: ctx.headers }).catch(() => undefined);
      }
      throw error;
    }
  },

  async requireSession(ctx: AuthRequestContext): Promise<AuthContext> {
    const authContext = await this.getSession(ctx);
    if (!authContext) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }
    return authContext;
  },

  async listMemberships(ctx: AuthRequestContext): Promise<AuthMembership[]> {
    const authContext = await this.requireSession(ctx);
    return membershipRepository.listActiveByUser(authContext.user.id);
  },

  async switchClinic(
    data: SwitchClinicDto,
    ctx: AuthRequestContext,
  ): Promise<AuthContext> {
    const authContext = await this.requireSession(ctx);

    const membership = await membershipRepository.findActiveByUserAndClinic(
      authContext.user.id,
      data.clinicId,
    );

    if (!membership) {
      throw new AppError(ErrorCode.MEMBERSHIP_NOT_FOUND);
    }

    if (membership.status !== "active") {
      throw new AppError(ErrorCode.MEMBERSHIP_INACTIVE);
    }

    const updatedSession = await sessionRepository.updateActiveClinicId(
      authContext.session.id,
      data.clinicId,
    );

    if (!updatedSession) {
      throw new AppError(ErrorCode.INTERNAL_ERROR);
    }

    const permissions = await resolvePermissions(membership);

    return {
      user: authContext.user,
      session: updatedSession,
      membership,
      permissions,
    };
  },

  async requestPasswordReset(
    data: RequestPasswordResetDto,
    ctx: AuthRequestContext,
  ): Promise<void> {
    try {
      await auth.api.requestPasswordReset({
        body: {
          email: data.email,
          redirectTo:
            data.redirectTo ?? AUTH_CONSTANTS.DEFAULT_PASSWORD_RESET_REDIRECT,
        },
        headers: ctx.headers,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;

      // Do not leak whether the email exists
      if (isBetterAuthError(error)) {
        const code =
          error.body &&
          typeof error.body === "object" &&
          "code" in error.body &&
          typeof (error.body as { code?: unknown }).code === "string"
            ? (error.body as { code: string }).code
            : undefined;

        if (code === "USER_NOT_FOUND" || error.statusCode === 404) {
          return;
        }
      }

      mapBetterAuthError(error);
    }
  },

  async resetPassword(
    data: ResetPasswordDto,
    ctx: AuthRequestContext,
  ): Promise<void> {
    try {
      await auth.api.resetPassword({
        body: {
          token: data.token,
          newPassword: data.newPassword,
        },
        headers: ctx.headers,
      });
    } catch (error) {
      mapBetterAuthError(error);
    }
  },

  async changePassword(
    data: ChangePasswordDto,
    ctx: AuthRequestContext,
  ): Promise<void> {
    await this.requireSession(ctx);

    try {
      await auth.api.changePassword({
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        headers: ctx.headers,
      });
    } catch (error) {
      mapBetterAuthError(error);
    }
  },
};
