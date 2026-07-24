import type { MembershipStatus, UserStatus } from "@/shared/auth"

export type AccountMembershipSummary = {
  clinicId: string
  clinicName: string
  roleName: string
  roleKey: string
  status: MembershipStatus
  isDefault: boolean
  isCurrent: boolean
}

export type AccountOverview = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  phone: string | null
  image: string | null
  status: UserStatus
  createdAt: Date
  lastLoginAt: Date | null
  memberships: AccountMembershipSummary[]
}

export type AccountProfile = {
  id: string
  name: string
  email: string
  phone: string | null
}
