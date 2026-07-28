import type { SubscriptionStatus } from "@/modules/billing/types/billing";
import type { ClinicSubscriptionStatus } from "@/modules/clinics/types/clinic";

/** Statuses that entitle Portal access and the account Assinatura tab. */
export const LIVING_SUBSCRIPTION_STATUSES: readonly SubscriptionStatus[] = [
  "trialing",
  "active",
  "past_due",
] as const;

export function isLivingSubscriptionStatus(
  status: SubscriptionStatus,
): boolean {
  return (LIVING_SUBSCRIPTION_STATUSES as readonly string[]).includes(status);
}

/**
 * Clinic SaaS entitlement (denormalized from the owner's subscription).
 * Same living set as user subscriptions; `none` is never entitled.
 */
export function isClinicEntitledStatus(
  status: ClinicSubscriptionStatus,
): boolean {
  return (LIVING_SUBSCRIPTION_STATUSES as readonly string[]).includes(status);
}
