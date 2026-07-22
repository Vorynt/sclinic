export type BillingCycle = "monthly" | "yearly"

export type Plan = {
  id: string
  name: string
  description: string | null
  priceCents: number
  currency: string
  billingCycle: BillingCycle
  maxUsers: number | null
  maxProfessionals: number | null
  maxStorageBytes: number | null
  stripePriceId: string | null
  isActive: boolean
}

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"

export type Subscription = {
  id: string
  clinicId: string
  planId: string
  gateway: string
  gatewayCustomerId: string | null
  gatewaySubscriptionId: string | null
  status: SubscriptionStatus
  cancelAtPeriodEnd: boolean
}
