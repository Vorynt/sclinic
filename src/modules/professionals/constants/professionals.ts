export const PROFESSIONAL_ROLE_KEYS = ["doctor", "nurse"] as const

export type ProfessionalRoleKey = (typeof PROFESSIONAL_ROLE_KEYS)[number]

export const PROFESSIONALS_CONSTANTS = {
  INVITE_TTL_MS: 7 * 24 * 60 * 60 * 1000,
} as const

export const PROFESSIONAL_ROLE_LABELS: Record<ProfessionalRoleKey, string> = {
  doctor: "Médico(a)",
  nurse: "Enfermeiro(a)",
}

export const TREATMENT_PRONOUN_KEYS = [
  "dr",
  "dra",
  "sr",
  "sra",
  "enf",
  "enfa",
] as const

export type TreatmentPronounKey = (typeof TREATMENT_PRONOUN_KEYS)[number]

export const TREATMENT_PRONOUN_LABELS: Record<TreatmentPronounKey, string> = {
  dr: "Dr.",
  dra: "Dra.",
  sr: "Sr.",
  sra: "Sra.",
  enf: "Enf.",
  enfa: "Enfa.",
}

export const AFFILIATION_TYPE_LABELS = {
  attending: "Assistente",
  coordinator: "Coordenador(a)",
  locum: "Plantonista",
  resident: "Residente",
} as const

export type AffiliationTypeLabel = keyof typeof AFFILIATION_TYPE_LABELS

export const ACCOUNT_STATUS_LABELS = {
  invite_pending: "Convite pendente",
  invite_expired: "Convite expirado",
  invite_revoked: "Convite cancelado",
  active: "Ativo",
  inactive: "Inativo",
} as const

export const COUNCIL_TYPE_LABELS = {
  CRM: "CRM",
  CRO: "CRO",
  COREN: "COREN",
  CRF: "CRF",
  OTHER: "Outro",
} as const

export const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const

export function getProfessionalRoleLabel(
  roleKey: string,
  fallbackName?: string,
): string {
  if (roleKey in PROFESSIONAL_ROLE_LABELS) {
    return PROFESSIONAL_ROLE_LABELS[roleKey as ProfessionalRoleKey]
  }
  return fallbackName ?? roleKey
}

export function getAffiliationTypeLabel(type: string): string {
  if (type in AFFILIATION_TYPE_LABELS) {
    return AFFILIATION_TYPE_LABELS[type as AffiliationTypeLabel]
  }
  return type
}

export function getTreatmentPronounLabel(pronoun: string): string {
  if (pronoun in TREATMENT_PRONOUN_LABELS) {
    return TREATMENT_PRONOUN_LABELS[pronoun as TreatmentPronounKey]
  }
  return pronoun
}

/** Display name with optional treatment pronoun (e.g. "Dra. Ana Silva"). */
export function formatProfessionalDisplayName(params: {
  fullName: string | null | undefined
  treatmentPronoun?: string | null
  fallback?: string
}): string {
  const name = params.fullName?.trim()
  if (!name) {
    return params.fallback ?? "—"
  }
  if (!params.treatmentPronoun) {
    return name
  }
  return `${getTreatmentPronounLabel(params.treatmentPronoun)} ${name}`
}

/** Scheduling label: display name, optionally with specialty. */
export function formatProfessionalSchedulingLabel(params: {
  fullName: string | null | undefined
  treatmentPronoun?: string | null
  specialty?: string | null
  fallback?: string
}): string {
  const displayName = formatProfessionalDisplayName({
    fullName: params.fullName,
    treatmentPronoun: params.treatmentPronoun,
    fallback: params.fallback,
  })
  const specialty = params.specialty?.trim()
  return specialty ? `${displayName} · ${specialty}` : displayName
}
