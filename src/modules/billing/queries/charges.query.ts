import { queryOptions } from "@tanstack/react-query"

import { getBillingSummaryAction } from "@/modules/billing/actions/get-billing-summary"
import { getChargeByAppointmentAction } from "@/modules/billing/actions/get-charge-by-appointment"
import { listChargesAction } from "@/modules/billing/actions/list-charges"
import type { ListChargesInput } from "@/modules/billing/schemas/charge.schema"
import { unwrapActionResult } from "@/shared/errors"

export const chargesQueryKeys = {
  all: ["charges"] as const,
  lists: () => [...chargesQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...chargesQueryKeys.lists(), filters ?? {}] as const,
  byAppointment: (appointmentId: string) =>
    [...chargesQueryKeys.all, "appointment", appointmentId] as const,
  summary: () => [...chargesQueryKeys.all, "summary"] as const,
}

export const chargesQueries = {
  list: (filters?: ListChargesInput) =>
    queryOptions({
      queryKey: chargesQueryKeys.list(filters),
      queryFn: async () =>
        unwrapActionResult(await listChargesAction(filters)),
    }),

  byAppointment: (appointmentId: string) =>
    queryOptions({
      queryKey: chargesQueryKeys.byAppointment(appointmentId),
      queryFn: async () =>
        unwrapActionResult(
          await getChargeByAppointmentAction({ appointmentId }),
        ),
    }),

  summary: () =>
    queryOptions({
      queryKey: chargesQueryKeys.summary(),
      queryFn: async () =>
        unwrapActionResult(await getBillingSummaryAction()),
    }),
}
