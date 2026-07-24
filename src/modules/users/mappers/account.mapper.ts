import type { MembershipStatus, UserStatus } from "@/shared/auth"
import type {
  AccountMembershipSummary,
  AccountOverview,
  AccountProfile,
} from "@/modules/users/types/account"

const USER_STATUSES = new Set<UserStatus>(["active", "inactive", "suspended"])
const MEMBERSHIP_STATUSES = new Set<MembershipStatus>([
  "active",
  "invited",
  "suspended",
  "removed",
])

function toUserStatus(value: unknown): UserStatus {
  if (typeof value === "string" && USER_STATUSES.has(value as UserStatus)) {
    return value as UserStatus
  }
  return "active"
}

function toMembershipStatus(value: unknown): MembershipStatus {
  if (
    typeof value === "string" &&
    MEMBERSHIP_STATUSES.has(value as MembershipStatus)
  ) {
    return value as MembershipStatus
  }
  return "active"
}

export function toAccountProfile(row: {
  id: string
  name: string
  email: string
  phone: string | null
}): AccountProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
  }
}

export function toAccountMembershipSummary(row: {
  clinicId: string
  clinicName: string | null
  roleName: string
  roleKey: string
  status: unknown
  isDefault: boolean
  isCurrent: boolean
}): AccountMembershipSummary {
  return {
    clinicId: row.clinicId,
    clinicName: row.clinicName?.trim() || "Clínica",
    roleName: row.roleName,
    roleKey: row.roleKey,
    status: toMembershipStatus(row.status),
    isDefault: row.isDefault,
    isCurrent: row.isCurrent,
  }
}

export function toAccountOverview(params: {
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    phone: string | null
    image: string | null
    status: unknown
    createdAt: Date
    lastLoginAt: Date | null
  }
  memberships: AccountMembershipSummary[]
}): AccountOverview {
  return {
    id: params.user.id,
    name: params.user.name,
    email: params.user.email,
    emailVerified: params.user.emailVerified,
    phone: params.user.phone,
    image: params.user.image,
    status: toUserStatus(params.user.status),
    createdAt: params.user.createdAt,
    lastLoginAt: params.user.lastLoginAt,
    memberships: params.memberships,
  }
}
