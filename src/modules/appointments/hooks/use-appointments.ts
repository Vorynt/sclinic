"use client"

import { useQuery } from "@tanstack/react-query"

import {
  appointmentsQueries,
  type AppointmentsRangeFilters,
} from "@/modules/appointments/queries/appointments.query"

export function useAppointmentsQuery(filters: AppointmentsRangeFilters) {
  return useQuery(appointmentsQueries.list(filters))
}

export function useCalendarClinicHoursQuery() {
  return useQuery(appointmentsQueries.calendarHours())
}
