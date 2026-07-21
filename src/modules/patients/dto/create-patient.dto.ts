import type { CreatePatientInput } from "@/modules/patients/schemas/patient.schema"
import type { Patient } from "@/modules/patients/types/patient"

/** Validated create payload (digits-only CPF). */
export type CreatePatientDto = CreatePatientInput

export type CreatePatientResult = Patient
