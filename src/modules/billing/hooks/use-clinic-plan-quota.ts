import { useQuery } from "@tanstack/react-query"

import { billingQueries } from "@/modules/billing/queries/billing.query"

export function useClinicPlanQuota() {
  return useQuery(billingQueries.clinicPlanQuota())
}
