/**
 * Domain patient type exposed to actions / UI.
 * `name` / `cpf` mirror the Zod action contract (maps to fullName / document in DB).
 */

export type PatientStatus = "active" | "inactive" | "archived"

export type Patient = {
  id: string
  clinicId: string
  name: string
  cpf: string
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  /** Administrative notes only — not a medical record. */
  notes?: string | null
  addressStreet?: string | null
  addressNumber?: string | null
  addressComplement?: string | null
  addressNeighborhood?: string | null
  addressCity?: string | null
  addressState?: string | null
  addressZip?: string | null
  status: PatientStatus
  createdAt: Date
  updatedAt: Date
}
