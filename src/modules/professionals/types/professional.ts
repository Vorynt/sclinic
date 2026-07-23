export type ProfessionalAccountStatus =
  | "invite_pending"
  | "invite_expired"
  | "invite_revoked"
  | "active"
  | "inactive"

export type AffiliationType =
  | "attending"
  | "coordinator"
  | "locum"
  | "resident"

export type ProfessionalStatus = "active" | "inactive"

export type CouncilType = "CRM" | "CRO" | "COREN" | "CRF" | "OTHER"

export type ProfessionalListItem = {
  id: string
  fullName: string
  email: string | null
  roleKey: string
  roleName: string
  affiliationType: AffiliationType
  affiliationId: string
  status: ProfessionalStatus
  accountStatus: ProfessionalAccountStatus
  councilType: string | null
  councilNumber: string | null
  councilState: string | null
  specialty: string | null
  biography: string | null
  invitationId: string | null
  userId: string | null
  createdAt: Date
  updatedAt: Date
}

export type ProfessionalSchedulingItem = {
  id: string
  fullName: string
  specialty: string | null
}

export type ProfessionalInvitePreview = {
  tokenValid: true
  fullName: string
  email: string
  clinicName: string
  roleName: string
  affiliationType: string
  councilType: string | null
  councilNumber: string | null
  councilState: string | null
  specialty: string | null
  biography: string | null
  professionalId: string
  expiresAt: Date
}
