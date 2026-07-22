import type { MembershipStatus } from "@/shared/auth"

export type ClinicMember = {
  id: string
  userId: string
  clinicId: string
  roleId: string
  roleKey: string
  roleName: string
  status: MembershipStatus
  isDefault: boolean
  joinedAt: Date
  userName: string
  userEmail: string
  userImage: string | null
}
