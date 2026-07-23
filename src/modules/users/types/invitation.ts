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
  professionalId: string | null
  status: InvitationStatus
  expiresAt: Date
  acceptedAt: Date | null
  createdAt: Date
}

export type InviteAccess = {
  email: string
  clinicName: string
  roleName: string
  needsPasswordSetup: boolean
  isProfessionalInvite: boolean
  expiresAt: Date
}

export type AssignableRole = {
  id: string
  key: string
  name: string
  description: string | null
}
