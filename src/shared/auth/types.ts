import type { PermissionKey } from "@/config/permissions"

export type UserStatus = "active" | "inactive" | "suspended"

export type MembershipStatus =
  | "active"
  | "invited"
  | "suspended"
  | "removed"

export type AuthUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  phone: string | null
  status: UserStatus
  mustChangePassword: boolean
}

export type AuthSession = {
  id: string
  userId: string
  token: string
  expiresAt: Date
  activeClinicId: string | null
}

export type AuthMembership = {
  id: string
  clinicId: string
  roleId: string
  roleKey: string
  roleName: string
  isDefault: boolean
  status: MembershipStatus
  /** Present when loaded for the clinic switcher. */
  clinicName?: string
}

/**
 * Authenticated request context used by guards and domain services.
 */
export type AuthContext = {
  user: AuthUser
  session: AuthSession
  membership: AuthMembership | null
  permissions: PermissionKey[]
  /**
   * User has suspended clinic link(s) but no active membership.
   * Used to send them to the membership-inactive screen instead of onboarding.
   */
  hasSuspendedMembershipOnly: boolean
  /**
   * User has 2+ active clinic memberships, none default, and no activeClinicId.
   * Used to send them to the clinic selector before the dashboard.
   */
  needsClinicSelection: boolean
}

export type AuthRequestContext = {
  headers: Headers
}
