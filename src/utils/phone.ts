import { formatMask, unmaskValue } from "@/utils/mask"

/** Formata telefone BR (fixo ou celular) a partir de dígitos. */
export function formatPhone(phone: string): string {
  const digits = unmaskValue(phone)
  if (!digits) return ""
  return formatMask(digits, "phone")
}
