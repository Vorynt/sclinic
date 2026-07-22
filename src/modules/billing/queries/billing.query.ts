import { queryOptions } from "@tanstack/react-query"

import { listPlansAction } from "@/modules/billing/actions/list-plans"
import { unwrapActionResult } from "@/shared/errors"

export const billingQueryKeys = {
  all: ["billing"] as const,
  plans: ["billing", "plans"] as const,
}

export const billingQueries = {
  plans: () =>
    queryOptions({
      queryKey: billingQueryKeys.plans,
      queryFn: async () => unwrapActionResult(await listPlansAction()),
    }),
}
