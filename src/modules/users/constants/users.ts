export const USERS_CONSTANTS = {
  /** Collaborator invite TTL. */
  INVITE_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  OWNER_ROLE_KEY: "owner",
} as const

/** System roles that can be assigned via invite / role change (team staff). */
export const ASSIGNABLE_ROLE_KEYS = [
  "admin",
  "manager",
  "receptionist",
  "financial",
] as const

export type AssignableRoleKey = (typeof ASSIGNABLE_ROLE_KEYS)[number]

export const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gestor",
  receptionist: "Recepcionista",
  doctor: "Médico(a)",
  nurse: "Enfermeiro(a)",
  financial: "Financeiro",
}

/** Display status for team table rows (members + pending invites). */
export type TeamRowStatus =
  | "active"
  | "suspended"
  | "invite_pending"

export const TEAM_STATUS_LABELS: Record<TeamRowStatus, string> = {
  active: "Ativo",
  suspended: "Suspenso",
  invite_pending: "Convite pendente",
}

export function getRoleLabel(roleKey: string, fallbackName?: string): string {
  return ROLE_LABELS[roleKey] ?? fallbackName ?? roleKey
}

export function getTeamStatusLabel(status: TeamRowStatus): string {
  return TEAM_STATUS_LABELS[status]
}
