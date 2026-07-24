import { queryOptions } from "@tanstack/react-query"

import { listClinicalAlertsAction } from "@/modules/medical-records/actions/list-clinical-alerts"
import { unwrapActionResult } from "@/shared/errors"

export const clinicalAlertsQueryKeys = {
  all: ["clinical-alerts"] as const,
  lists: () => [...clinicalAlertsQueryKeys.all, "list"] as const,
  list: (patientId: string) =>
    [...clinicalAlertsQueryKeys.lists(), patientId] as const,
}

export const clinicalAlertsQueries = {
  list: (patientId: string) =>
    queryOptions({
      queryKey: clinicalAlertsQueryKeys.list(patientId),
      queryFn: async () =>
        unwrapActionResult(await listClinicalAlertsAction({ patientId })),
    }),
}
