import type { SubscriptionStatus } from "@/modules/billing/types/billing";
import type { ClinicSubscriptionStatus } from "@/modules/clinics/types/clinic";

/** Days of free trial on first Stripe Checkout (card required, charge after trial). */
export const SUBSCRIPTION_TRIAL_DAYS = 7;

/**
 * Trial only on first subscription. Reactivation (had a gateway sub before)
 * skips trial — otherwise canceled users could restart free forever.
 */
export function shouldOfferSubscriptionTrial(
  existing: { gatewaySubscriptionId: string | null } | null | undefined,
): boolean {
  return !existing?.gatewaySubscriptionId;
}

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
