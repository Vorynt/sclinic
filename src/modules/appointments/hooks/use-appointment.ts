"use client"

import { useQuery } from "@tanstack/react-query"

import { appointmentsQueries } from "@/modules/appointments/queries/appointments.query"

export function useAppointmentQuery(id?: string) {
  return useQuery({
    ...appointmentsQueries.detail(id ?? ""),
    enabled: Boolean(id),
  })
}
