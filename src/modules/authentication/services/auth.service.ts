import { randomBytes } from "node:crypto";

import { auth, isBetterAuthError, mapBetterAuthError } from "@/core/auth";
import { AUTH_CONSTANTS } from "@/modules/authentication/constants/auth";
import type {
  ChangePasswordDto,
  DisableTwoFactorDto,
  EnableTwoFactorDto,
  RegenerateBackupCodesDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  RevokeSessionDto,
  SignInDto,
  SignUpDto,
  SwitchClinicDto,
  VerifyBackupCodeDto,
  VerifyTotpDto,
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
  AuthSessionDevice,
  AuthUser,
  BackupCodesResult,
  SignInResult,
  TwoFactorEnableResult,
} from "@/modules/authentication/types/auth";
import { assertUserCanAuthenticate } from "@/modules/authentication/utils/assert-user";
import { assertCanRevokeSession } from "@/modules/authentication/utils/session-rules";
import { billingService } from "@/modules/billing/services/billing.service";
import type { AuthRequestContext } from "@/shared/auth";
import { AppError } from "@/shared/errors/app-error";
import { ErrorCode } from "@/shared/errors/codes";

type BaSessionResult = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

type BaUserLike = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  phone?: string | null;
  status?: unknown;
  mustChangePassword?: boolean | null;
  twoFactorEnabled?: boolean | null;
  productTourCompleted?: boolean | null;
};

async function resolvePermissions(
  membership: AuthMembership | null,
): Promise<AuthContext["permissions"]> {
  if (!membership) return [];
  return permissionRepository.listKeysByRoleId(membership.roleId);
}

type MembershipResolution = {
  membership: AuthMembership | null;
  needsClinicSelection: boolean;
};

/**
 * Resolves the clinic membership for the session.
 * Priority: activeClinicId → isDefault → sole active membership → selector (2+).
 */
async function resolveMembership(
  userId: string,
  activeClinicId: string | null,
): Promise<MembershipResolution> {
  if (activeClinicId) {
    const membership = await membershipRepository.findActiveByUserAndClinic(
      userId,
      activeClinicId,
    );
    return { membership, needsClinicSelection: false };
  }

  const defaultMembership =
    await membershipRepository.findDefaultByUser(userId);
  if (defaultMembership) {
    return { membership: defaultMembership, needsClinicSelection: false };
  }

  const active = await membershipRepository.listActiveByUser(userId);
  if (active.length === 1) {
    return { membership: active[0]!, needsClinicSelection: false };
  }
  if (active.length > 1) {
    return { membership: null, needsClinicSelection: true };
  }

  return { membership: null, needsClinicSelection: false };
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

function mapBaUser(baUser: BaUserLike): AuthUser {
  return toAuthUser({
    id: baUser.id,
    name: baUser.name,
    email: baUser.email,
    emailVerified: baUser.emailVerified,
    image: baUser.image ?? null,
    phone: baUser.phone ?? null,
    status: toUserStatus(baUser.status),
    mustChangePassword: Boolean(baUser.mustChangePassword),
    twoFactorEnabled: Boolean(baUser.twoFactorEnabled),
    productTourCompleted: Boolean(baUser.productTourCompleted),
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
  let { membership, needsClinicSelection } = await resolveMembership(
    user.id,
    session.activeClinicId,
  );

  // Stale activeClinicId (removed membership) → clear and re-resolve without it
  if (session.activeClinicId && !membership) {
    const updated = await sessionRepository.updateActiveClinicId(
      session.id,
      null,
    );
    session = updated ?? { ...session, activeClinicId: null };
    const fallback = await resolveMembership(user.id, null);
    membership = fallback.membership;
    needsClinicSelection = fallback.needsClinicSelection;
  }

  let subscriptionBlockedClinic: AuthContext["subscriptionBlockedClinic"] =
    null;

  // Owner SaaS entitlement (ADR-003): block before persisting activeClinicId
  if (membership) {
    const entitlement = await billingService.getClinicEntitlement(
      membership.clinicId,
    );
    if (entitlement && !entitlement.entitled) {
      subscriptionBlockedClinic = {
        clinicId: membership.clinicId,
        clinicName: entitlement.name,
        isOwner: membership.roleKey === "owner",
      };
      if (session.activeClinicId) {
        const updated = await sessionRepository.updateActiveClinicId(
          session.id,
          null,
        );
        session = updated ?? { ...session, activeClinicId: null };
      }
      membership = null;
      needsClinicSelection = true;
    }
  }

  if (membership) {
    const ensured = await ensureActiveClinic(session, membership);
    session = ensured.session;
    membership = ensured.membership;
  }

  const permissions = await resolvePermissions(membership);

  const hasSuspendedMembershipOnly =
    !membership &&
    !needsClinicSelection &&
    !subscriptionBlockedClinic &&
    (await membershipRepository.hasSuspendedByUser(user.id));

  return {
    user,
    session,
    membership,
    permissions,
    hasSuspendedMembershipOnly,
    needsClinicSelection: !membership && needsClinicSelection,
    subscriptionBlockedClinic,
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
  user: BaUserLike;
  token?: string | null;
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

function isTwoFactorRedirect(
  result: unknown,
): result is { twoFactorRedirect: true } {
  return (
    typeof result === "object" &&
    result !== null &&
    "twoFactorRedirect" in result &&
    (result as { twoFactorRedirect?: unknown }).twoFactorRedirect === true
  );
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

    const result = await this.signIn(
      { email: params.email, password: params.newPassword, rememberMe: true },
      ctx,
    );

    if (result.status !== "authenticated") {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }

    return result.context;
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

  async signIn(data: SignInDto, ctx: AuthRequestContext): Promise<SignInResult> {
    try {
      const result = await auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        },
        headers: ctx.headers,
      });

      if (isTwoFactorRedirect(result)) {
        return { status: "twoFactorRequired" };
      }

      const authContext = await buildAuthContextFromBaResult(result);
      await userRepository.updateLastLoginAt(authContext.user.id);

      return { status: "authenticated", context: authContext };
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

    await billingService.assertClinicEntitled(data.clinicId);

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
      needsClinicSelection: false,
      subscriptionBlockedClinic: null,
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
    const existingOwners = await membershipRepository.listOwnerByUser(
      input.userId,
    );
    if (existingOwners.length > 0) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Você já possui uma clínica própria.",
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
      const result = await auth.api.changePassword({
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          revokeOtherSessions: data.revokeOtherSessions,
        },
        headers: ctx.headers,
      });

      if (authContext.user.mustChangePassword) {
        await userRepository.setMustChangePassword(authContext.user.id, false);
      }

      // BA deletes every session and issues a new cookie when revoking others.
      if (data.revokeOtherSessions) {
        if (!result?.token) {
          throw new AppError(ErrorCode.UNAUTHORIZED);
        }
        const nextContext = await buildAuthContextFromBaResult({
          user: result.user,
          token: result.token,
        });
        return {
          ...nextContext,
          user: { ...nextContext.user, mustChangePassword: false },
        };
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      mapBetterAuthError(error);
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

  /** Syncs the auth display name (e.g. after professional invite profile completion). */
  async updateDisplayName(userId: string, name: string): Promise<void> {
    await userRepository.updateName(userId, name);
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

  async verifyTotp(
    data: VerifyTotpDto,
    ctx: AuthRequestContext,
  ): Promise<AuthContext> {
    try {
      const result = await auth.api.verifyTOTP({
        body: { code: data.code },
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

  async verifyBackupCode(
    data: VerifyBackupCodeDto,
    ctx: AuthRequestContext,
  ): Promise<AuthContext> {
    try {
      const result = await auth.api.verifyBackupCode({
        body: { code: data.code },
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

  async enableTwoFactor(
    data: EnableTwoFactorDto,
    ctx: AuthRequestContext,
  ): Promise<TwoFactorEnableResult> {
    await this.requireSession(ctx);

    try {
      const result = await auth.api.enableTwoFactor({
        body: { password: data.password },
        headers: ctx.headers,
      });

      if (!result?.totpURI || !result.backupCodes) {
        throw new AppError(ErrorCode.INTERNAL_ERROR);
      }

      return {
        totpURI: result.totpURI,
        backupCodes: result.backupCodes,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      mapBetterAuthError(error);
    }
  },

  async verifyTwoFactorSetup(
    data: VerifyTotpDto,
    ctx: AuthRequestContext,
  ): Promise<AuthContext> {
    const authContext = await this.requireSession(ctx);

    try {
      await auth.api.verifyTOTP({
        body: { code: data.code },
        headers: ctx.headers,
      });
    } catch (error) {
      mapBetterAuthError(error);
    }

    // BA may rotate the session cookie; request headers still have the old token.
    return {
      ...authContext,
      user: { ...authContext.user, twoFactorEnabled: true },
    };
  },

  async disableTwoFactor(
    data: DisableTwoFactorDto,
    ctx: AuthRequestContext,
  ): Promise<AuthContext> {
    const authContext = await this.requireSession(ctx);

    try {
      await auth.api.disableTwoFactor({
        body: { password: data.password },
        headers: ctx.headers,
      });
    } catch (error) {
      mapBetterAuthError(error);
    }

    // BA rotates the session cookie on disable; avoid getSession on stale headers.
    return {
      ...authContext,
      user: { ...authContext.user, twoFactorEnabled: false },
    };
  },

  async regenerateBackupCodes(
    data: RegenerateBackupCodesDto,
    ctx: AuthRequestContext,
  ): Promise<BackupCodesResult> {
    await this.requireSession(ctx);

    try {
      const result = await auth.api.generateBackupCodes({
        body: { password: data.password },
        headers: ctx.headers,
      });

      if (!result?.backupCodes) {
        throw new AppError(ErrorCode.INTERNAL_ERROR);
      }

      return { backupCodes: result.backupCodes };
    } catch (error) {
      if (error instanceof AppError) throw error;
      mapBetterAuthError(error);
    }
  },

  async listSessions(ctx: AuthRequestContext): Promise<AuthSessionDevice[]> {
    const authContext = await this.requireSession(ctx);
    const sessions = await sessionRepository.listActiveByUserId(
      authContext.user.id,
    );

    return sessions.map((item) => ({
      ...item,
      isCurrent: item.id === authContext.session.id,
    }));
  },

  async revokeSession(
    data: RevokeSessionDto,
    ctx: AuthRequestContext,
  ): Promise<void> {
    const authContext = await this.requireSession(ctx);
    assertCanRevokeSession(authContext.session.id, data.sessionId);

    const target = await sessionRepository.findById(data.sessionId);
    if (!target || target.userId !== authContext.user.id) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Sessão não encontrada.",
      });
    }

    try {
      await auth.api.revokeSession({
        body: { token: target.token },
        headers: ctx.headers,
      });
    } catch (error) {
      mapBetterAuthError(error);
    }
  },

  async revokeOtherSessions(ctx: AuthRequestContext): Promise<void> {
    await this.requireSession(ctx);

    try {
      await auth.api.revokeOtherSessions({
        headers: ctx.headers,
      });
    } catch (error) {
      mapBetterAuthError(error);
    }
  },

  async completeProductTour(ctx: AuthRequestContext): Promise<AuthContext> {
    const authContext = await this.requireSession(ctx);
    if (authContext.user.productTourCompleted) {
      return authContext;
    }

    await userRepository.setProductTourCompleted(authContext.user.id);
    return {
      ...authContext,
      user: { ...authContext.user, productTourCompleted: true },
    };
  },
};
