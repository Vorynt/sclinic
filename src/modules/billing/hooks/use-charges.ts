"use client"

import { useQuery } from "@tanstack/react-query"

import { chargesQueries } from "@/modules/billing/queries/charges.query"
import type { ListChargesInput } from "@/modules/billing/schemas/charge.schema"

export function useChargesQuery(filters?: ListChargesInput) {
  return useQuery(chargesQueries.list(filters))
}

export function useChargeByAppointmentQuery(
  appointmentId: string,
  enabled = true,
) {
  return useQuery({
    ...chargesQueries.byAppointment(appointmentId),
    enabled: Boolean(appointmentId) && enabled,
  })
}

export function useActiveChargesByAppointmentsQuery(
  appointmentIds: string[],
  enabled = true,
) {
  return useQuery({
    ...chargesQueries.byAppointments(appointmentIds),
    enabled: enabled && appointmentIds.length > 0,
  })
}

export function useBillingSummaryQuery(enabled = true) {
  return useQuery({
    ...chargesQueries.summary(),
    enabled,
  })
}

export function useDelinquentPatientsQuery(enabled = true) {
  return useQuery({
    ...chargesQueries.delinquents(),
    enabled,
  })
}
