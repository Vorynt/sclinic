import { queryOptions } from "@tanstack/react-query"

import { getClinicAction } from "@/modules/clinics/actions/get-clinic"
import { listClinicsByIdsAction } from "@/modules/clinics/actions/list-clinics-by-ids"
import { unwrapActionResult } from "@/shared/errors"

export const clinicsQueryKeys = {
  all: ["clinics"] as const,
  detail: (clinicId: string) => ["clinics", "detail", clinicId] as const,
  byIds: (clinicIds: string[]) =>
    ["clinics", "byIds", [...clinicIds].sort()] as const,
}

export const clinicsQueries = {
  detail: (clinicId: string) =>
    queryOptions({
      queryKey: clinicsQueryKeys.detail(clinicId),
      queryFn: async () =>
        unwrapActionResult(await getClinicAction({ clinicId })),
      enabled: Boolean(clinicId),
    }),

  byIds: (clinicIds: string[]) =>
    queryOptions({
      queryKey: clinicsQueryKeys.byIds(clinicIds),
      queryFn: async () =>
        unwrapActionResult(await listClinicsByIdsAction({ clinicIds })),
      enabled: clinicIds.length > 0,
    }),
}
