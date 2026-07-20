import type { Patient } from "@/modules/patients/types/patient"

export type CreatePatientDto = {
  name: string
  cpf: string
}

// Placeholder — será validado via schema na Fase de infraestrutura
export type CreatePatientInput = CreatePatientDto

export type CreatePatientResult = Patient
