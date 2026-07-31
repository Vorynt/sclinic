import type { PermissionKey } from "@/config/permissions"
import { hasAllPermissions, hasAnyPermission } from "@/core/permissions"
import { membershipRepository } from "@/modules/authentication/repositories/membership.repository"
import { authService } from "@/modules/authentication/services/auth.service"
import type { AuthContext } from "@/modules/authentication/types/auth"
import { billingService } from "@/modules/billing/services/billing.service"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"

export type AuthContextWithClinic = AuthContext & {
  membership: NonNullable<AuthContext["membership"]>
  clinicId: string
}

/** Owner teardown: auth without SaaS entitlement (ADR-003 amend). */
export type AuthContextOwnedClinicTeardown = AuthContext & {
  clinicId: string
  membership: NonNullable<AuthContext["membership"]>
}

/**
 * Requires an authenticated session with an active (non-suspended) user.
 */
export async function requireAuth(
  ctx: AuthRequestContext,
): Promise<AuthContext> {
  return authService.requireSession(ctx)
}

/**
 * Blocks app usage until the user replaces a provisional password.
 */
export async function requirePasswordReady(
  ctx: AuthRequestContext,
): Promise<AuthContext> {
  const authContext = await requireAuth(ctx)

  if (authContext.user.mustChangePassword) {
    throw new AppError(ErrorCode.PASSWORD_CHANGE_REQUIRED)
  }

  return authContext
}

/**
 * Requires auth + an active clinic membership on the session
 * with a living SaaS entitlement on that clinic (ADR-003).
 */
export async function requireClinic(
  ctx: AuthRequestContext,
): Promise<AuthContextWithClinic> {
  const authContext = await requirePasswordReady(ctx)

  if (!authContext.membership || !authContext.session.activeClinicId) {
    throw new AppError(ErrorCode.CLINIC_REQUIRED)
  }

  await billingService.assertClinicEntitled(
    authContext.session.activeClinicId,
  )

  return {
    ...authContext,
    membership: authContext.membership,
    clinicId: authContext.session.activeClinicId,
  }
}

/**
 * Requires auth + clinic + all listed permissions.
 */
export async function requirePermission(
  ctx: AuthRequestContext,
  ...required: PermissionKey[]
): Promise<AuthContextWithClinic> {
  const authContext = await requireClinic(ctx)

  if (!hasAllPermissions(authContext.permissions, required)) {
    throw new AppError(ErrorCode.FORBIDDEN, {
      meta: { required },
    })
  }

  return authContext
}

/**
 * Owner-only clinic teardown without SaaS entitlement.
 * Use for deleting a clinic when the subscription is unpaid/canceled.
 */
export async function requireOwnedClinicTeardown(
  ctx: AuthRequestContext,
  clinicId: string,
): Promise<AuthContextOwnedClinicTeardown> {
  const authContext = await requirePasswordReady(ctx)

  const membership = await membershipRepository.findActiveByUserAndClinic(
    authContext.user.id,
    clinicId,
  )

  if (!membership || membership.roleKey !== "owner") {
    throw new AppError(ErrorCode.FORBIDDEN, {
      message: "Apenas o proprietário pode excluir a clínica.",
    })
  }

  return {
    ...authContext,
    membership,
    clinicId,
  }
}

/**
 * Requires auth + clinic + at least one of the listed permissions.
 */
export async function requireAnyPermission(
  ctx: AuthRequestContext,
  ...required: PermissionKey[]
): Promise<AuthContextWithClinic> {
  const authContext = await requireClinic(ctx)

  if (!hasAnyPermission(authContext.permissions, required)) {
    throw new AppError(ErrorCode.FORBIDDEN, {
      meta: { required },
    })
  }

  return authContext
}
