import { queryOptions } from "@tanstack/react-query"

import { listWaitlistAction } from "@/modules/appointments/actions/list-waitlist"
import type { WaitlistStatus } from "@/modules/appointments/types/waitlist"
import { unwrapActionResult } from "@/shared/errors"

export type WaitlistFilters = {
  status?: WaitlistStatus
  professionalId?: string
}

export const waitlistQueryKeys = {
  all: ["waitlist"] as const,
  lists: () => [...waitlistQueryKeys.all, "list"] as const,
  list: (filters: WaitlistFilters = {}) =>
    [...waitlistQueryKeys.lists(), filters] as const,
}

export const waitlistQueries = {
  list: (filters: WaitlistFilters = {}) =>
    queryOptions({
      queryKey: waitlistQueryKeys.list(filters),
      queryFn: async () =>
        unwrapActionResult(await listWaitlistAction(filters)),
    }),
}
