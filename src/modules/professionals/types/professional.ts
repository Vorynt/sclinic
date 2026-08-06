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

export type CouncilType =
  | "CRM"
  | "CRO"
  | "COREN"
  | "CRF"
  | "CREFITO"
  | "CRP"
  | "OTHER"

export type ProfessionType =
  | "physician"
  | "dentist"
  | "physiotherapist"
  | "nurse"
  | "pharmacist"
  | "psychologist"
  | "other"

export type TreatmentPronoun =
  | "dr"
  | "dra"
  | "sr"
  | "sra"
  | "enf"
  | "enfa"
  | "ft"
  | "fta"

export type ProfessionalListItem = {
  id: string
  fullName: string | null
  professionType: ProfessionType
  treatmentPronoun: TreatmentPronoun | null
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
  fullName: string | null
  treatmentPronoun: TreatmentPronoun | null
  specialty: string | null
}

export type ProfessionalInvitePreview = {
  tokenValid: true
  fullName: string | null
  treatmentPronoun: TreatmentPronoun | null
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
