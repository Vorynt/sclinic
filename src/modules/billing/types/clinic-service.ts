/**
 * Domain clinic service type exposed to actions / UI.
 */

export type ClinicService = {
  id: string
  clinicId: string
  name: string
  description?: string | null
  priceCents: number
  currency: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
