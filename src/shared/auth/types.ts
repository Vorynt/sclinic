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
}

/**
 * Authenticated request context used by guards and domain services.
 */
export type AuthContext = {
  user: AuthUser
  session: AuthSession
  membership: AuthMembership | null
  permissions: PermissionKey[]
}

export type AuthRequestContext = {
  headers: Headers
}
