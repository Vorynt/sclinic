import { queryOptions } from "@tanstack/react-query"

import { listScheduleBlocksAction } from "@/modules/appointments/actions/list-schedule-blocks"
import { unwrapActionResult } from "@/shared/errors"

export type ScheduleBlocksRangeFilters = {
  from: Date
  to: Date
  professionalIds?: string[]
}

export const scheduleBlocksQueryKeys = {
  all: ["schedule-blocks"] as const,
  lists: () => [...scheduleBlocksQueryKeys.all, "list"] as const,
  list: (filters: ScheduleBlocksRangeFilters) =>
    [
      ...scheduleBlocksQueryKeys.lists(),
      {
        from: filters.from.toISOString(),
        to: filters.to.toISOString(),
        professionalIds: filters.professionalIds?.length
          ? [...filters.professionalIds].sort()
          : undefined,
      },
    ] as const,
}

export const scheduleBlocksQueries = {
  list: (filters: ScheduleBlocksRangeFilters) =>
    queryOptions({
      queryKey: scheduleBlocksQueryKeys.list(filters),
      queryFn: async () =>
        unwrapActionResult(await listScheduleBlocksAction(filters)),
    }),
}
