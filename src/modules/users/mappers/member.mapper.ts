import type { MembershipStatus } from "@/shared/auth"
import type { ClinicMember } from "@/modules/users/types/member"

const MEMBERSHIP_STATUSES = new Set<MembershipStatus>([
  "active",
  "invited",
  "suspended",
  "removed",
])

function toMembershipStatus(value: unknown): MembershipStatus {
  if (
    typeof value === "string" &&
    MEMBERSHIP_STATUSES.has(value as MembershipStatus)
  ) {
    return value as MembershipStatus
  }
  return "active"
}

export function toClinicMember(row: {
  id: string
  userId: string
  clinicId: string
  roleId: string
  roleKey: string
  roleName: string
  status: unknown
  isDefault: boolean
  joinedAt: Date
  userName: string
  userEmail: string
  userImage: string | null
}): ClinicMember {
  return {
    id: row.id,
    userId: row.userId,
    clinicId: row.clinicId,
    roleId: row.roleId,
    roleKey: row.roleKey,
    roleName: row.roleName,
    status: toMembershipStatus(row.status),
    isDefault: row.isDefault,
    joinedAt: row.joinedAt,
    userName: row.userName,
    userEmail: row.userEmail,
    userImage: row.userImage,
  }
}
