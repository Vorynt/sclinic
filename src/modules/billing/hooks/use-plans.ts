import { useQuery } from "@tanstack/react-query"

import { billingQueries } from "@/modules/billing/queries/billing.query"

export function usePlans() {
  return useQuery(billingQueries.plans())
}
