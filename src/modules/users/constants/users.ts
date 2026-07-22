export const USERS_CONSTANTS = {
  /** Collaborator invite TTL. */
  INVITE_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  OWNER_ROLE_KEY: "owner",
} as const

/** System roles that can be assigned via invite / role change. */
export const ASSIGNABLE_ROLE_KEYS = [
  "admin",
  "manager",
  "receptionist",
  "doctor",
  "nurse",
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

export function getRoleLabel(roleKey: string, fallbackName?: string): string {
  return ROLE_LABELS[roleKey] ?? fallbackName ?? roleKey
}
