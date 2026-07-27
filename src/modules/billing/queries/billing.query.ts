import { queryOptions } from "@tanstack/react-query"

import { getClinicPlanQuotaAction } from "@/modules/billing/actions/get-clinic-plan-quota"
import { getMySubscriptionAction } from "@/modules/billing/actions/get-my-subscription"
import { hasLivingSubscriptionAction } from "@/modules/billing/actions/has-living-subscription"
import { listPlansAction } from "@/modules/billing/actions/list-plans"
import { unwrapActionResult } from "@/shared/errors"

export const billingQueryKeys = {
  all: ["billing"] as const,
  plans: ["billing", "plans"] as const,
  mySubscription: ["billing", "my-subscription"] as const,
  hasLivingSubscription: ["billing", "has-living-subscription"] as const,
  clinicPlanQuota: ["billing", "clinic-plan-quota"] as const,
}

export const billingQueries = {
  plans: () =>
    queryOptions({
      queryKey: billingQueryKeys.plans,
      queryFn: async () => unwrapActionResult(await listPlansAction()),
    }),
  mySubscription: () =>
    queryOptions({
      queryKey: billingQueryKeys.mySubscription,
      queryFn: async () =>
        unwrapActionResult(await getMySubscriptionAction()),
      // Portal cancel syncs via webhook — always revalidate on return.
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
    }),
  hasLivingSubscription: () =>
    queryOptions({
      queryKey: billingQueryKeys.hasLivingSubscription,
      queryFn: async () =>
        unwrapActionResult(await hasLivingSubscriptionAction()),
      staleTime: 60_000,
    }),
  clinicPlanQuota: () =>
    queryOptions({
      queryKey: billingQueryKeys.clinicPlanQuota,
      queryFn: async () =>
        unwrapActionResult(await getClinicPlanQuotaAction()),
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    }),
}
