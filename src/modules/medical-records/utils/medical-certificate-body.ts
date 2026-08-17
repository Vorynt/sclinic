import { escapeHtml } from "@/modules/medical-records/utils/escape-html"

export type MedicalCertificateBodyInput = {
  patientName: string
  patientDocument?: string | null
  daysOff: number
  cid?: string | null
  notes?: string | null
  locale?: string
}

function formatDaysOff(days: number, locale: string): string {
  const formatter = new Intl.PluralRules(locale)
  const rule = formatter.select(days)
  if (rule === "one") return `${days} dia`
  return `${days} dias`
}

/**
 * Builds plain text + HTML body for a medical certificate (ADR-010).
 * Pure helper — no I/O.
 */
export function buildMedicalCertificateBody(
  input: MedicalCertificateBodyInput,
): { body: string; plainText: string } {
  const locale = input.locale ?? "pt-BR"
  const docPart = input.patientDocument
    ? `, portador(a) do documento ${input.patientDocument},`
    : ","
  const daysLabel = formatDaysOff(input.daysOff, locale)
  const cid = input.cid?.trim()
  const notes = input.notes?.trim()

  const plainText = [
    `Atesto para os devidos fins que ${input.patientName}${docPart} necessita de ${daysLabel} de afastamento de suas atividades.`,
    cid ? `CID: ${cid}` : null,
    notes ? `Observações: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  const body = [
    `<p>Atesto para os devidos fins que <strong>${escapeHtml(input.patientName)}</strong>${escapeHtml(docPart)} necessita de <strong>${escapeHtml(daysLabel)}</strong> de afastamento de suas atividades.</p>`,
    cid ? `<p><strong>CID:</strong> ${escapeHtml(cid)}</p>` : null,
    notes
      ? `<p><strong>Observações:</strong> ${escapeHtml(notes)}</p>`
      : null,
  ]
    .filter(Boolean)
    .join("")

  return { body, plainText }
}
