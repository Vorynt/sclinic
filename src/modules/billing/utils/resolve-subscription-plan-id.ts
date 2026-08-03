/**
 * Resolves local `plans.id` from a Stripe subscription sync payload.
 *
 * Prefer the current price (Portal upgrades change the item price but keep
 * checkout `metadata.planId`). Fall back to metadata, then the local row.
 */
export function resolveSubscriptionPlanId(input: {
  planIdFromPrice: string | null;
  metadataPlanId: string | null;
  existingPlanId: string | null;
}): string | null {
  return (
    input.planIdFromPrice ??
    input.metadataPlanId ??
    input.existingPlanId ??
    null
  );
}
