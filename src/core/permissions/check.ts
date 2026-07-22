import type { PermissionKey } from "@/config/permissions"

/**
 * Returns true when every required permission is present.
 */
export function hasAllPermissions(
  granted: readonly string[],
  required: readonly PermissionKey[],
): boolean {
  if (required.length === 0) return true
  const set = new Set(granted)
  return required.every((key) => set.has(key))
}

/**
 * Returns true when at least one required permission is present.
 */
export function hasAnyPermission(
  granted: readonly string[],
  required: readonly PermissionKey[],
): boolean {
  if (required.length === 0) return true
  const set = new Set(granted)
  return required.some((key) => set.has(key))
}
