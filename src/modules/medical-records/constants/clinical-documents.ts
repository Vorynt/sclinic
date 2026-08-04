/**
 * Clinical document kinds stored on `prescriptions` (ADR-010).
 * Product UI: "Documentos". Table name remains `prescriptions`.
 */

export const CLINICAL_DOCUMENT_KINDS = [
  "prescription",
  "attendance_declaration",
  "medical_certificate",
  "exam_request",
] as const

export type ClinicalDocumentKind = (typeof CLINICAL_DOCUMENT_KINDS)[number]

/** Kinds implemented in this ship (others are enum-ready only). */
export const IMPLEMENTED_CLINICAL_DOCUMENT_KINDS = [
  "prescription",
  "attendance_declaration",
] as const satisfies readonly ClinicalDocumentKind[]

export const CLINICAL_DOCUMENT_KIND_LABELS: Record<ClinicalDocumentKind, string> =
  {
    prescription: "Receita",
    attendance_declaration: "Declaração de comparecimento",
    medical_certificate: "Atestado",
    exam_request: "Solicitação de exames",
  }

export function clinicalDocumentKindLabel(kind: ClinicalDocumentKind): string {
  return CLINICAL_DOCUMENT_KIND_LABELS[kind]
}

/** Clinic custom layouts (ADR-008) apply only to prescriptions. */
export function usesClinicPrescriptionLayouts(
  kind: ClinicalDocumentKind,
): boolean {
  return kind === "prescription"
}
