import type { PermissionKey } from "@/config/permissions"

export type UserStatus = "active" | "inactive" | "suspended"

export type MembershipStatus =
  | "active"
  | "invited"
  | "suspended"
  | "removed"

/** Mirrors clinics.subscription_status for switcher entitlement checks. */
export type ClinicSubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"

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
  /** Present when loaded for the clinic switcher (SaaS entitlement mirror). */
  clinicSubscriptionStatus?: ClinicSubscriptionStatus
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
  /**
   * Active clinic was blocked because the owner's SaaS subscription is not living.
   * Cleared from the session; user is sent to select-clinic with a notice.
   */
  subscriptionBlockedClinic: {
    clinicId: string
    clinicName: string
    isOwner: boolean
  } | null
}

export type AuthRequestContext = {
  headers: Headers
}
