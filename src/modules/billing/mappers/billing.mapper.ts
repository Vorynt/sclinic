import type { Plan, Subscription } from "@/modules/billing/types/billing"
import type {
  Plan as PlanRow,
  Subscription as SubscriptionRow,
} from "@/db/schema"

const BILLING_CYCLES = new Set(["monthly", "yearly"])
const SUBSCRIPTION_STATUSES = new Set([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
])

export function toPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    currency: row.currency,
    billingCycle: BILLING_CYCLES.has(row.billingCycle)
      ? row.billingCycle
      : "monthly",
    maxUsers: row.maxUsers,
    maxProfessionals: row.maxProfessionals,
    maxStorageBytes: row.maxStorageBytes,
    stripePriceId: row.stripePriceId,
    isActive: row.isActive,
  }
}

export function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    clinicId: row.clinicId,
    planId: row.planId,
    gateway: row.gateway,
    gatewayCustomerId: row.gatewayCustomerId,
    gatewaySubscriptionId: row.gatewaySubscriptionId,
    status: SUBSCRIPTION_STATUSES.has(row.status) ? row.status : "incomplete",
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
  }
}
