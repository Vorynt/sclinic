import { escapeHtml } from "@/modules/medical-records/utils/escape-html"

export type ExamRequestBodyInput = {
  patientName: string
  patientDocument?: string | null
  exams: string[]
  notes?: string | null
}

function formatExamListPlain(exams: string[]): string {
  return exams.map((exam, index) => `${index + 1}. ${exam}`).join("\n")
}

function formatExamListHtml(exams: string[]): string {
  const items = exams
    .map((exam) => `<li>${escapeHtml(exam)}</li>`)
    .join("")
  return `<ul>${items}</ul>`
}

/**
 * Builds plain text + HTML body for an exam request (ADR-010).
 * Pure helper — no I/O.
 */
export function buildExamRequestBody(
  input: ExamRequestBodyInput,
): { body: string; plainText: string } {
  const docPart = input.patientDocument
    ? `, portador(a) do documento ${input.patientDocument},`
    : ","
  const notes = input.notes?.trim()
  const examsPlain = formatExamListPlain(input.exams)
  const examsHtml = formatExamListHtml(input.exams)

  const plainText = [
    `Solicito a realização dos seguintes exames complementares para ${input.patientName}${docPart}`,
    examsPlain,
    notes ? `Indicação clínica: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  const body = [
    `<p>Solicito a realização dos seguintes exames complementares para <strong>${escapeHtml(input.patientName)}</strong>${escapeHtml(docPart)}</p>`,
    examsHtml,
    notes
      ? `<p><strong>Indicação clínica:</strong> ${escapeHtml(notes)}</p>`
      : null,
  ]
    .filter(Boolean)
    .join("")

  return { body, plainText }
}
