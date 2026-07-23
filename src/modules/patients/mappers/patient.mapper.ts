import type { Patient as PatientRow } from "@/db/schema"
import type { Patient, PatientStatus } from "@/modules/patients/types/patient"

const PATIENT_STATUSES = new Set<PatientStatus>([
  "active",
  "inactive",
  "archived",
])

function toPatientStatus(value: unknown): PatientStatus {
  if (
    typeof value === "string" &&
    PATIENT_STATUSES.has(value as PatientStatus)
  ) {
    return value as PatientStatus
  }
  return "active"
}

export function toPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    clinicId: row.clinicId,
    name: row.fullName,
    cpf: row.document ?? "",
    email: row.email,
    phone: row.phone,
    birthDate: row.birthDate,
    status: toPatientStatus(row.status),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
