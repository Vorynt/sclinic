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
  status: PatientStatus
  createdAt: Date
  updatedAt: Date
}
