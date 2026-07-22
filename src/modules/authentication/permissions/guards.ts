import type { PermissionKey } from "@/config/permissions"
import { hasAllPermissions, hasAnyPermission } from "@/core/permissions"
import { authService } from "@/modules/authentication/services/auth.service"
import type { AuthContext } from "@/modules/authentication/types/auth"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"

export type AuthContextWithClinic = AuthContext & {
  membership: NonNullable<AuthContext["membership"]>
  clinicId: string
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
 * Requires auth + an active clinic membership on the session.
 */
export async function requireClinic(
  ctx: AuthRequestContext,
): Promise<AuthContextWithClinic> {
  const authContext = await requireAuth(ctx)

  if (!authContext.membership || !authContext.session.activeClinicId) {
    throw new AppError(ErrorCode.CLINIC_REQUIRED)
  }

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
