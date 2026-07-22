export type InvitationStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "revoked"
  | "resent"

export type ClinicInvitation = {
  id: string
  clinicId: string
  email: string
  roleId: string
  roleKey: string
  roleName: string
  invitedBy: string
  invitedByName: string | null
  status: InvitationStatus
  expiresAt: Date
  acceptedAt: Date | null
  createdAt: Date
}

export type AssignableRole = {
  id: string
  key: string
  name: string
  description: string | null
}
