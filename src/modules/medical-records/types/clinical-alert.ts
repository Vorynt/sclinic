export type ClinicalAlertKind =
  | "allergy"
  | "restriction"
  | "attention"
  | "other"

export type ClinicalAlertSeverity = "low" | "medium" | "high"

export type ClinicalAlert = {
  id: string
  clinicId: string
  patientId: string
  kind: ClinicalAlertKind
  label: string
  severity: ClinicalAlertSeverity
  notes: string | null
  createdAt: Date
  updatedAt: Date
}
