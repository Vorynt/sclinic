import { HELP_FAQ_ADMIN } from "@/modules/help/constants/faq/admin"
import { HELP_FAQ_CLINICIAN } from "@/modules/help/constants/faq/clinician"
import { HELP_FAQ_FINANCIAL } from "@/modules/help/constants/faq/financial"
import { HELP_FAQ_MANAGER } from "@/modules/help/constants/faq/manager"
import { HELP_FAQ_NURSE } from "@/modules/help/constants/faq/nurse"
import { HELP_FAQ_OWNER } from "@/modules/help/constants/faq/owner"
import { HELP_FAQ_RECEPTIONIST } from "@/modules/help/constants/faq/receptionist"
import type { HelpFaqItem } from "@/modules/help/types/help"

export const HELP_ROLE_KEYS = [
  "owner",
  "admin",
  "manager",
  "receptionist",
  "clinician",
  "nurse",
  "financial",
] as const

export type HelpRoleKey = (typeof HELP_ROLE_KEYS)[number]

export const HELP_FAQ_BY_ROLE: Record<HelpRoleKey, HelpFaqItem[]> = {
  owner: HELP_FAQ_OWNER,
  admin: HELP_FAQ_ADMIN,
  manager: HELP_FAQ_MANAGER,
  receptionist: HELP_FAQ_RECEPTIONIST,
  clinician: HELP_FAQ_CLINICIAN,
  nurse: HELP_FAQ_NURSE,
  financial: HELP_FAQ_FINANCIAL,
}

export function isHelpRoleKey(value: string): value is HelpRoleKey {
  return (HELP_ROLE_KEYS as readonly string[]).includes(value)
}

/**
 * FAQ curado para o papel da membership ativa.
 * Papel desconhecido → conteúdo do proprietário (mais completo).
 */
export function getHelpFaqForRole(
  roleKey: string | null | undefined,
): HelpFaqItem[] {
  if (roleKey && isHelpRoleKey(roleKey)) {
    return HELP_FAQ_BY_ROLE[roleKey]
  }
  return HELP_FAQ_OWNER
}

/** @deprecated Prefer `getHelpFaqForRole` — alias do FAQ do owner. */
export const HELP_FAQ = HELP_FAQ_OWNER
