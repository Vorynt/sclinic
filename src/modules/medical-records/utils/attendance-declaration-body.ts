import { escapeHtml } from "@/modules/medical-records/utils/escape-html"

export type AttendanceDeclarationBodyInput = {
  patientName: string
  patientDocument?: string | null
  appointmentStartsAt: Date
  professionalName?: string | null
  clinicName: string
  notes?: string | null
  locale?: string
}

function formatDateTime(value: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(value)
}

/**
 * Builds plain text + HTML body for an attendance declaration (ADR-010).
 * Pure helper — no I/O.
 */
export function buildAttendanceDeclarationBody(
  input: AttendanceDeclarationBodyInput,
): { body: string; plainText: string } {
  const locale = input.locale ?? "pt-BR"
  const when = formatDateTime(input.appointmentStartsAt, locale)
  const docPart = input.patientDocument
    ? `, portador(a) do documento ${input.patientDocument},`
    : ","
  const professionalPart = input.professionalName
    ? ` com o(a) profissional ${input.professionalName}`
    : ""
  const notes = input.notes?.trim()

  const plainText = [
    `Declaramos para os devidos fins que ${input.patientName}${docPart} compareceu a esta unidade (${input.clinicName}) em ${when}${professionalPart}.`,
    notes ? `Observações: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  const body = [
    `<p>Declaramos para os devidos fins que <strong>${escapeHtml(input.patientName)}</strong>${escapeHtml(docPart)} compareceu a esta unidade (<strong>${escapeHtml(input.clinicName)}</strong>) em <strong>${escapeHtml(when)}</strong>${professionalPart ? escapeHtml(professionalPart) : ""}.</p>`,
    notes
      ? `<p><strong>Observações:</strong> ${escapeHtml(notes)}</p>`
      : null,
  ]
    .filter(Boolean)
    .join("")

  return { body, plainText }
}
