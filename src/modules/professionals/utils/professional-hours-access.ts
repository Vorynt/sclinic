import { Permission } from "@/config/permissions"
import type { PermissionKey } from "@/config/permissions"
import { hasAllPermissions } from "@/core/permissions"

/**
 * Who may read/edit a professional's weekly hours (ADR-011 + self-ownership).
 * - `professionals.manage` → admin override (any professional in the clinic)
 * - otherwise → only the linked user of that professional profile
 */
export function canAccessProfessionalHours(params: {
  permissions: readonly PermissionKey[]
  ownProfessionalId: string | null
  targetProfessionalId: string
}): boolean {
  if (
    hasAllPermissions(params.permissions, [Permission.PROFESSIONALS_MANAGE])
  ) {
    return true
  }

  return (
    params.ownProfessionalId != null &&
    params.ownProfessionalId === params.targetProfessionalId
  )
}
