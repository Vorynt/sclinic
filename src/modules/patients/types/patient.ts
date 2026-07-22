/**
 * Domain patient type exposed to actions / UI.
 * `name` / `cpf` mirror the Zod action contract (maps to fullName / document in DB).
 */

import type { PatientGender } from "@/modules/patients/schemas/patient.schema"

export type Patient = {
  id: string
  name: string
  socialName?: string | null
  cpf: string
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  gender?: PatientGender | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  notes?: string | null
  addressStreet?: string | null
  addressNumber?: string | null
  addressComplement?: string | null
  addressNeighborhood?: string | null
  addressCity?: string | null
  addressState?: string | null
  addressZip?: string | null
  createdAt: Date
  updatedAt: Date
}
