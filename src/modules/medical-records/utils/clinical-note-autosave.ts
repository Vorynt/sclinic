import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export type ClinicalNoteSaveStatus =
  | "idle"
  | "dirty"
  | "saving"
  | "saved"
  | "error"

export function fingerprintClinicalNote(
  content: unknown,
  plainText: string,
): string {
  return JSON.stringify({
    content,
    plainText: plainText.trim(),
  })
}

export function canPersistClinicalNote(
  plainText: string,
  fingerprint: string,
  savedFingerprint: string,
): boolean {
  return plainText.trim().length > 0 && fingerprint !== savedFingerprint
}

export function formatClinicalNoteSavedAt(date: Date | string): string {
  return format(new Date(date), "HH:mm", { locale: ptBR })
}

export function getClinicalNoteSaveStatusLabel(
  status: ClinicalNoteSaveStatus,
  lastSavedAt: Date | string | null,
): string | null {
  if (status === "saving") {
    return "Salvando…"
  }

  if (status === "error") {
    return "Não foi possível salvar"
  }

  if (!lastSavedAt) {
    return null
  }

  return `Salvo às ${formatClinicalNoteSavedAt(lastSavedAt)}`
}
