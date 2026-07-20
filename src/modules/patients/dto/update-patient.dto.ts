import type { Patient } from "@/modules/patients/types/patient"

export type UpdatePatientDto = {
  id: string
  name?: string
  cpf?: string
}

export type UpdatePatientInput = UpdatePatientDto

export type UpdatePatientResult = Patient
