import type { InvitationStatus } from "@/modules/users/types/invitation"
import type {
  AffiliationType,
  ProfessionalAccountStatus,
  ProfessionalListItem,
  ProfessionalStatus,
  TreatmentPronoun,
} from "@/modules/professionals/types/professional"
import { getRoleLabel } from "@/modules/users/constants/users"

const AFFILIATION_TYPES = new Set<AffiliationType>([
  "attending",
  "coordinator",
  "locum",
  "resident",
])

const PROFESSIONAL_STATUSES = new Set<ProfessionalStatus>([
  "active",
  "inactive",
])

const TREATMENT_PRONOUNS = new Set<TreatmentPronoun>([
  "dr",
  "dra",
  "sr",
  "sra",
  "enf",
  "enfa",
])

const INVITE_OPEN_STATUSES = new Set<InvitationStatus>([
  "pending",
  "resent",
  "expired",
  "revoked",
])

function toAffiliationType(value: unknown): AffiliationType {
  if (
    typeof value === "string" &&
    AFFILIATION_TYPES.has(value as AffiliationType)
  ) {
    return value as AffiliationType
  }
  return "attending"
}

function toProfessionalStatus(value: unknown): ProfessionalStatus {
  if (
    typeof value === "string" &&
    PROFESSIONAL_STATUSES.has(value as ProfessionalStatus)
  ) {
    return value as ProfessionalStatus
  }
  return "inactive"
}

function toTreatmentPronoun(value: unknown): TreatmentPronoun | null {
  if (
    typeof value === "string" &&
    TREATMENT_PRONOUNS.has(value as TreatmentPronoun)
  ) {
    return value as TreatmentPronoun
  }
  return null
}

function toInvitationStatus(value: unknown): InvitationStatus | null {
  if (typeof value !== "string") return null
  if (
    value === "pending" ||
    value === "accepted" ||
    value === "expired" ||
    value === "revoked" ||
    value === "resent"
  ) {
    return value
  }
  return null
}

export function computeAccountStatus(params: {
  invitationStatus: unknown
  invitationExpiresAt: Date | null
  professionalStatus: ProfessionalStatus
  affiliationStatus: unknown
  now?: Date
}): ProfessionalAccountStatus {
  const now = params.now ?? new Date()
  const inviteStatus = toInvitationStatus(params.invitationStatus)

  if (inviteStatus && INVITE_OPEN_STATUSES.has(inviteStatus)) {
    if (inviteStatus === "revoked") {
      return "invite_revoked"
    }

    const expiredByTime =
      params.invitationExpiresAt !== null &&
      params.invitationExpiresAt.getTime() <= now.getTime()

    if (inviteStatus === "expired" || expiredByTime) {
      return "invite_expired"
    }

    if (inviteStatus === "pending" || inviteStatus === "resent") {
      return "invite_pending"
    }
  }

  const affiliationInactive = params.affiliationStatus === "inactive"
  if (params.professionalStatus === "inactive" || affiliationInactive) {
    return "inactive"
  }

  return "active"
}

export type ProfessionalListRow = {
  id: string
  fullName: string | null
  treatmentPronoun: unknown
  email: string | null
  roleKey: string | null
  roleName: string | null
  affiliationType: unknown
  affiliationId: string
  affiliationStatus: unknown
  status: unknown
  councilType: string | null
  councilNumber: string | null
  councilState: string | null
  specialty: string | null
  biography: string | null
  invitationId: string | null
  invitationStatus: unknown
  invitationExpiresAt: Date | null
  userId: string | null
  createdAt: Date
  updatedAt: Date
}

export function toProfessionalListItem(
  row: ProfessionalListRow,
): ProfessionalListItem {
  const status = toProfessionalStatus(row.status)
  const roleKey = row.roleKey ?? ""

  return {
    id: row.id,
    fullName: row.fullName,
    treatmentPronoun: toTreatmentPronoun(row.treatmentPronoun),
    email: row.email,
    roleKey,
    roleName: getRoleLabel(roleKey, row.roleName ?? undefined),
    affiliationType: toAffiliationType(row.affiliationType),
    affiliationId: row.affiliationId,
    status,
    accountStatus: computeAccountStatus({
      invitationStatus: row.invitationStatus,
      invitationExpiresAt: row.invitationExpiresAt,
      professionalStatus: status,
      affiliationStatus: row.affiliationStatus,
    }),
    councilType: row.councilType,
    councilNumber: row.councilNumber,
    councilState: row.councilState,
    specialty: row.specialty,
    biography: row.biography,
    invitationId: row.invitationId,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
