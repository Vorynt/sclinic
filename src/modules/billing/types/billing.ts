import type {
  ClinicPlanQuota,
  PlanQuotaDimension,
  PlanQuotaLimits,
  PlanQuotaUsage,
} from "@/modules/billing/utils/plan-quota"

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
  userId: string
  planId: string
  gateway: string
  gatewayCustomerId: string | null
  gatewaySubscriptionId: string | null
  status: SubscriptionStatus
  trialEndsAt: Date | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

/** Subscription plus catalog plan — used by account UI. */
export type SubscriptionWithPlan = Subscription & {
  plan: Plan
}

export type {
  ClinicPlanQuota,
  PlanQuotaDimension,
  PlanQuotaLimits,
  PlanQuotaUsage,
}

/** Quota snapshot for shells / create gates (ADR-004). */
export type ClinicPlanQuotaView = ClinicPlanQuota & {
  isOwner: boolean
}
