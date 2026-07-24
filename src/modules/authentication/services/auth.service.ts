import { randomBytes } from "node:crypto";

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

type BaAuthUser = BaSessionResult["user"];

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

function mapBaUser(baUser: BaAuthUser): AuthUser {
  return toAuthUser({
    id: baUser.id,
    name: baUser.name,
    email: baUser.email,
    emailVerified: baUser.emailVerified,
    image: baUser.image ?? null,
    phone: (baUser as { phone?: string | null }).phone ?? null,
    status: toUserStatus((baUser as { status?: unknown }).status),
    mustChangePassword: Boolean(
      (baUser as { mustChangePassword?: boolean | null }).mustChangePassword,
    ),
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

/** Domain AuthContext from resolved user + session (memberships/permissions). */
async function buildAuthContextFromParts(
  user: AuthUser,
  sessionInput: AuthSession,
): Promise<AuthContext> {
  assertUserCanAuthenticate(user);

  let session = sessionInput;
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

  const hasSuspendedMembershipOnly =
    !membership &&
    (await membershipRepository.hasSuspendedByUser(user.id));

  return {
    user,
    session,
    membership,
    permissions,
    hasSuspendedMembershipOnly,
  };
}

async function buildAuthContext(ba: BaSessionResult): Promise<AuthContext> {
  return buildAuthContextFromParts(
    mapBaUser(ba.user),
    mapBaSession(ba.session),
  );
}

/**
 * After signInEmail/signUpEmail, nextCookies sets Set-Cookie on the response,
 * but request headers still lack the new cookie — so getSession(headers) is null.
 * Use the returned token and load the session from the DB instead.
 */
async function buildAuthContextFromBaResult(result: {
  user: BaAuthUser;
  token: string | null;
}): Promise<AuthContext> {
  if (!result.user || !result.token) {
    throw new AppError(ErrorCode.UNAUTHORIZED);
  }

  const session = await sessionRepository.findByToken(result.token);
  if (!session) {
    throw new AppError(ErrorCode.UNAUTHORIZED);
  }

  return buildAuthContextFromParts(mapBaUser(result.user), session);
}

function generateOpaquePassword(): string {
  return randomBytes(32).toString("base64url");
}

export const authService = {
  /**
   * Provisions a credential account for an invited collaborator.
   * Does not create a session. New users get an opaque provisional password
   * (never shown to admins) and mustChangePassword=true — they set a real
   * password via the invite token. Existing users keep their password.
   */
  async provisionInvitedUser(params: {
    name: string;
    email: string;
  }): Promise<{ user: AuthUser; created: boolean }> {
    const existing = await userRepository.findByEmail(params.email);
    if (existing) {
      return { user: existing, created: false };
    }

    const { hashPassword } = await import("better-auth/crypto");
    const passwordHash = await hashPassword(generateOpaquePassword());
    const created = await userRepository.createWithCredential({
      name: params.name,
      email: params.email,
      passwordHash,
    });

    return { user: created, created: true };
  },

  async requiresPasswordSetup(email: string): Promise<boolean> {
    const existing = await userRepository.findByEmail(email);
    if (!existing) return true;
    return existing.mustChangePassword;
  },

  /**
   * Sets the first password for an invited user (mustChangePassword) and
   * opens a session. Callers must have already validated the invite token.
   */
  async setPasswordAndSignIn(
    params: { email: string; newPassword: string },
    ctx: AuthRequestContext,
  ): Promise<AuthContext> {
    const existing = await userRepository.findByEmail(params.email);
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Conta não encontrada para este convite.",
      });
    }

    if (!existing.mustChangePassword) {
      throw new AppError(ErrorCode.FORBIDDEN, {
        message:
          "Esta conta já possui senha. Entre com seu e-mail e senha para continuar.",
      });
    }

    assertUserCanAuthenticate(existing);

    const { hashPassword } = await import("better-auth/crypto");
    const passwordHash = await hashPassword(params.newPassword);
    const updated = await userRepository.updateCredentialPassword(
      existing.id,
      passwordHash,
    );
    if (!updated) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        message: "Não foi possível atualizar a senha.",
      });
    }

    await userRepository.setMustChangePassword(existing.id, false);

    return this.signIn(
      { email: params.email, password: params.newPassword },
      ctx,
    );
  },

  async signUp(data: SignUpDto, ctx: AuthRequestContext): Promise<AuthContext> {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          callbackURL: AUTH_CONSTANTS.DEFAULT_EMAIL_VERIFICATION_CALLBACK,
          ...(data.phone ? { phone: data.phone } : {}),
        },
        headers: ctx.headers,
      });

      return buildAuthContextFromBaResult(result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      mapBetterAuthError(error);
    }
  },

  async signIn(data: SignInDto, ctx: AuthRequestContext): Promise<AuthContext> {
    try {
      const result = await auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
        },
        headers: ctx.headers,
      });

      const authContext = await buildAuthContextFromBaResult(result);
      await userRepository.updateLastLoginAt(authContext.user.id);

      return authContext;
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
    return membershipRepository.listForClinicSwitcher(authContext.user.id);
  },

  async switchClinic(
    data: SwitchClinicDto,
    ctx: AuthRequestContext,
  ): Promise<AuthContext> {
    const authContext = await this.requireSession(ctx);

    const membership = await membershipRepository.findByUserAndClinic(
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
      hasSuspendedMembershipOnly: false,
    };
  },

  /**
   * Public contract for clinics onboarding: create owner membership
   * and set the session active clinic.
   */
  async createOwnerMembership(input: {
    userId: string;
    clinicId: string;
    sessionId: string;
  }): Promise<AuthMembership> {
    const existing = await membershipRepository.listActiveByUser(input.userId);
    if (existing.length > 0) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Você já possui uma clínica vinculada.",
      });
    }

    const ownerRoleId =
      await membershipRepository.findSystemRoleIdByKey("owner");
    if (!ownerRoleId) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        message: "Papel owner não configurado. Execute o seed RBAC.",
      });
    }

    const membership = await membershipRepository.create({
      userId: input.userId,
      clinicId: input.clinicId,
      roleId: ownerRoleId,
      isDefault: true,
    });

    const updatedSession = await sessionRepository.updateActiveClinicId(
      input.sessionId,
      input.clinicId,
    );

    if (!updatedSession) {
      throw new AppError(ErrorCode.INTERNAL_ERROR);
    }

    return membership;
  },

  /**
   * Public contract for clinics: revoke all memberships and clear sessions
   * pointing at a deleted clinic.
   */
  async revokeAccessForClinic(clinicId: string): Promise<void> {
    await membershipRepository.softDeleteAllForClinic(clinicId);
    await sessionRepository.clearActiveClinicIdForClinic(clinicId);
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
  ): Promise<AuthContext> {
    const authContext = await this.requireSession(ctx);

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

    if (authContext.user.mustChangePassword) {
      await userRepository.setMustChangePassword(authContext.user.id, false);
    }

    return this.requireSession(ctx);
  },

  /**
   * Marks the user's email as verified after invite acceptance.
   * Owning the invite token (delivered by email) is proof of address ownership.
   */
  async markEmailVerifiedFromInvite(userId: string): Promise<void> {
    await userRepository.setEmailVerified(userId, true);
  },

  async resendVerificationEmail(ctx: AuthRequestContext): Promise<void> {
    const authContext = await this.requireSession(ctx);

    if (authContext.user.emailVerified) {
      return;
    }

    try {
      await auth.api.sendVerificationEmail({
        body: {
          email: authContext.user.email,
          callbackURL: AUTH_CONSTANTS.DEFAULT_EMAIL_VERIFICATION_CALLBACK,
        },
        headers: ctx.headers,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (isBetterAuthError(error)) {
        const code =
          error.body &&
          typeof error.body === "object" &&
          "code" in error.body &&
          typeof (error.body as { code?: unknown }).code === "string"
            ? (error.body as { code: string }).code
            : undefined;

        // Race: verified between requireSession and BA call.
        if (code === "EMAIL_ALREADY_VERIFIED") {
          return;
        }
      }

      mapBetterAuthError(error);
    }
  },
};
