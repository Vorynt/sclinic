import { formatMask, unmaskValue } from "@/utils/mask"

/** Formata CNPJ a partir de dígitos (com ou sem máscara). */
export function formatCnpj(cnpj: string): string {
  const digits = unmaskValue(cnpj)
  if (!digits) return ""
  return formatMask(digits, "cnpj")
}
