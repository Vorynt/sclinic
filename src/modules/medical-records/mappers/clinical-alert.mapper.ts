import type {
  ClinicalAlertKind,
  ClinicalAlertSeverity,
  ClinicalAlert,
} from "@/modules/medical-records/types/clinical-alert"

type ClinicalAlertRow = {
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

export function toClinicalAlert(row: ClinicalAlertRow): ClinicalAlert {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    kind: row.kind,
    label: row.label,
    severity: row.severity,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
