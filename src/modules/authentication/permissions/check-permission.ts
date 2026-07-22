import type { PermissionKey } from "@/config/permissions"
import { hasAllPermissions, hasAnyPermission } from "@/core/permissions"
import { authService } from "@/modules/authentication/services/auth.service"
import type { AuthContextWithClinic } from "@/modules/authentication/permissions/guards"
import type { AuthRequestContext } from "@/shared/auth"

export type PermissionCheckResult =
  | { ok: true; auth: AuthContextWithClinic }
  | {
      ok: false
      reason: "unauthenticated" | "no_clinic" | "forbidden"
    }

/**
 * Soft permission check for layout gates (does not throw).
 */
export async function checkPermission(
  ctx: AuthRequestContext,
  required: readonly PermissionKey[],
  mode: "all" | "any" = "all",
): Promise<PermissionCheckResult> {
  const session = await authService.getSession(ctx)

  if (!session) {
    return { ok: false, reason: "unauthenticated" }
  }

  if (!session.membership || !session.session.activeClinicId) {
    return { ok: false, reason: "no_clinic" }
  }

  const granted = session.permissions
  const allowed =
    mode === "all"
      ? hasAllPermissions(granted, required)
      : hasAnyPermission(granted, required)

  if (!allowed) {
    return { ok: false, reason: "forbidden" }
  }

  return {
    ok: true,
    auth: {
      ...session,
      membership: session.membership,
      clinicId: session.session.activeClinicId,
    },
  }
}
