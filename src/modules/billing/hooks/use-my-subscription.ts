import { useQuery } from "@tanstack/react-query"

import { billingQueries } from "@/modules/billing/queries/billing.query"

export function useMySubscription(options?: {
  refetchInterval?: number | false | (() => number | false)
}) {
  return useQuery({
    ...billingQueries.mySubscription(),
    ...options,
  })
}
