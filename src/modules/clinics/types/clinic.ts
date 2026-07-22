export type ClinicSubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"

export type Clinic = {
  id: string
  name: string
  tradeName: string | null
  document: string | null
  email: string | null
  phone: string | null
  website: string | null
  timezone: string
  subscriptionStatus: ClinicSubscriptionStatus
  addressStreet: string | null
  addressNumber: string | null
  addressComplement: string | null
  addressNeighborhood: string | null
  addressCity: string | null
  addressState: string | null
  addressZip: string | null
}
