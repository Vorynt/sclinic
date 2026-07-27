import type { PermissionKey } from "@/config/permissions"
import { ALL_PERMISSIONS } from "@/config/permissions"
import type {
  AuthMembership,
  AuthSession,
  AuthUser,
  MembershipStatus,
  UserStatus,
} from "@/modules/authentication/types/auth"

const USER_STATUSES = new Set<UserStatus>(["active", "inactive", "suspended"])
const MEMBERSHIP_STATUSES = new Set<MembershipStatus>([
  "active",
  "invited",
  "suspended",
  "removed",
])
const PERMISSION_SET = new Set<string>(ALL_PERMISSIONS)

export function toUserStatus(value: unknown): UserStatus {
  if (typeof value === "string" && USER_STATUSES.has(value as UserStatus)) {
    return value as UserStatus
  }
  return "active"
}

export function toMembershipStatus(value: unknown): MembershipStatus {
  if (
    typeof value === "string" &&
    MEMBERSHIP_STATUSES.has(value as MembershipStatus)
  ) {
    return value as MembershipStatus
  }
  return "active"
}

export function toAuthUser(row: {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  phone: string | null
  status: unknown
  mustChangePassword?: boolean | null
}): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    image: row.image,
    phone: row.phone,
    status: toUserStatus(row.status),
    mustChangePassword: Boolean(row.mustChangePassword),
  }
}

export function toAuthSession(row: {
  id: string
  userId: string
  token: string
  expiresAt: Date
  activeClinicId: string | null
}): AuthSession {
  return {
    id: row.id,
    userId: row.userId,
    token: row.token,
    expiresAt: row.expiresAt,
    activeClinicId: row.activeClinicId,
  }
}

export function toAuthMembership(row: {
  id: string
  clinicId: string
  roleId: string
  roleKey: string
  roleName: string
  isDefault: boolean
  status: unknown
  clinicName?: string | null
  clinicSubscriptionStatus?: string | null
}): AuthMembership {
  return {
    id: row.id,
    clinicId: row.clinicId,
    roleId: row.roleId,
    roleKey: row.roleKey,
    roleName: row.roleName,
    isDefault: row.isDefault,
    status: toMembershipStatus(row.status),
    ...(row.clinicName != null && row.clinicName !== ""
      ? { clinicName: row.clinicName }
      : {}),
    ...(row.clinicSubscriptionStatus != null &&
    row.clinicSubscriptionStatus !== ""
      ? {
          clinicSubscriptionStatus:
            row.clinicSubscriptionStatus as AuthMembership["clinicSubscriptionStatus"],
        }
      : {}),
  }
}

export function toPermissionKeys(keys: string[]): PermissionKey[] {
  return keys.filter((key): key is PermissionKey => PERMISSION_SET.has(key))
}
