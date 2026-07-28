"use client"

import { useQuery } from "@tanstack/react-query"

import {
  appointmentsQueries,
  type AppointmentsCountFilters,
  type AppointmentsRangeFilters,
  type PatientAppointmentsFilters,
} from "@/modules/appointments/queries/appointments.query"

export function useAppointmentsQuery(filters: AppointmentsRangeFilters) {
  return useQuery(appointmentsQueries.list(filters))
}

export function useAppointmentsCountQuery(
  filters: AppointmentsCountFilters,
  enabled = true,
) {
  return useQuery({
    ...appointmentsQueries.count(filters),
    enabled,
  })
}

export function usePatientAppointmentsQuery(
  filters: PatientAppointmentsFilters,
  enabled = true,
) {
  return useQuery({
    ...appointmentsQueries.patientList(filters),
    enabled: enabled && Boolean(filters.patientId),
  })
}

export function useCalendarClinicHoursQuery() {
  return useQuery(appointmentsQueries.calendarHours())
}
