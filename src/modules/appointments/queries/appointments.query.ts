import { queryOptions } from "@tanstack/react-query"

import { getAppointmentAction } from "@/modules/appointments/actions/get-appointment"
import { listAppointmentsAction } from "@/modules/appointments/actions/list-appointments"
import { unwrapActionResult } from "@/shared/errors"

export type AppointmentsRangeFilters = {
  from: Date
  to: Date
}

export const appointmentsQueryKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentsQueryKeys.all, "list"] as const,
  list: (filters: AppointmentsRangeFilters) =>
    [
      ...appointmentsQueryKeys.lists(),
      { from: filters.from.toISOString(), to: filters.to.toISOString() },
    ] as const,
  details: () => [...appointmentsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...appointmentsQueryKeys.details(), id] as const,
}

export const appointmentsQueries = {
  list: (filters: AppointmentsRangeFilters) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.list(filters),
      queryFn: async () =>
        unwrapActionResult(await listAppointmentsAction(filters)),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.detail(id),
      queryFn: async () => unwrapActionResult(await getAppointmentAction(id)),
    }),
}
