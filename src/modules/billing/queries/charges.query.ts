import { queryOptions } from "@tanstack/react-query"

import { getBillingSummaryAction } from "@/modules/billing/actions/get-billing-summary"
import { getChargeByAppointmentAction } from "@/modules/billing/actions/get-charge-by-appointment"
import { listActiveChargesByAppointmentsAction } from "@/modules/billing/actions/list-active-charges-by-appointments"
import { listChargesAction } from "@/modules/billing/actions/list-charges"
import { listDelinquentPatientsAction } from "@/modules/billing/actions/list-delinquent-patients"
import type { ListChargesInput } from "@/modules/billing/schemas/charge.schema"
import { unwrapActionResult } from "@/shared/errors"

export const chargesQueryKeys = {
  all: ["charges"] as const,
  lists: () => [...chargesQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...chargesQueryKeys.lists(), filters ?? {}] as const,
  byAppointment: (appointmentId: string) =>
    [...chargesQueryKeys.all, "appointment", appointmentId] as const,
  byAppointments: (appointmentIds: string[]) =>
    [
      ...chargesQueryKeys.all,
      "appointments",
      [...appointmentIds].sort(),
    ] as const,
  summary: () => [...chargesQueryKeys.all, "summary"] as const,
  delinquents: () => [...chargesQueryKeys.all, "delinquents"] as const,
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

  byAppointments: (appointmentIds: string[]) =>
    queryOptions({
      queryKey: chargesQueryKeys.byAppointments(appointmentIds),
      queryFn: async () =>
        unwrapActionResult(
          await listActiveChargesByAppointmentsAction({ appointmentIds }),
        ),
    }),

  summary: () =>
    queryOptions({
      queryKey: chargesQueryKeys.summary(),
      queryFn: async () =>
        unwrapActionResult(await getBillingSummaryAction()),
    }),

  delinquents: () =>
    queryOptions({
      queryKey: chargesQueryKeys.delinquents(),
      queryFn: async () =>
        unwrapActionResult(await listDelinquentPatientsAction()),
    }),
}
