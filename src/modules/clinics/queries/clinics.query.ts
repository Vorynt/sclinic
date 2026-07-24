import { queryOptions } from "@tanstack/react-query"

import { getActiveClinicForSettingsAction } from "@/modules/clinics/actions/get-active-clinic-for-settings"
import { getClinicAction } from "@/modules/clinics/actions/get-clinic"
import { getClinicHoursAction } from "@/modules/clinics/actions/get-clinic-hours"
import { listClinicsByIdsAction } from "@/modules/clinics/actions/list-clinics-by-ids"
import { unwrapActionResult } from "@/shared/errors"

export const clinicsQueryKeys = {
  all: ["clinics"] as const,
  detail: (clinicId: string) => ["clinics", "detail", clinicId] as const,
  byIds: (clinicIds: string[]) =>
    ["clinics", "byIds", [...clinicIds].sort()] as const,
  activeSettings: ["clinics", "active-settings"] as const,
  hours: ["clinics", "hours"] as const,
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

  activeForSettings: () =>
    queryOptions({
      queryKey: clinicsQueryKeys.activeSettings,
      queryFn: async () =>
        unwrapActionResult(await getActiveClinicForSettingsAction()),
    }),

  hours: () =>
    queryOptions({
      queryKey: clinicsQueryKeys.hours,
      queryFn: async () => unwrapActionResult(await getClinicHoursAction()),
    }),
}
