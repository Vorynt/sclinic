export {
  requireAnyPermission,
  requireAuth,
  requireClinic,
  requireOwnedClinicTeardown,
  requirePasswordReady,
  requirePermission,
  type AuthContextOwnedClinicTeardown,
  type AuthContextWithClinic,
} from "@/modules/authentication/permissions/guards"
export {
  checkPermission,
  type PermissionCheckResult,
} from "@/modules/authentication/permissions/check-permission"
