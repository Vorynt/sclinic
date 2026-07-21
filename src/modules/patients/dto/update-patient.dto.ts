import type { UpdatePatientInput } from "@/modules/patients/schemas/patient.schema"
import type { Patient } from "@/modules/patients/types/patient"

/** Validated update payload (digits-only CPF when present). */
export type UpdatePatientDto = UpdatePatientInput

export type UpdatePatientResult = Patient
