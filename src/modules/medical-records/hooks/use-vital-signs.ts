"use client"

import { useQuery } from "@tanstack/react-query"

import {
  type PatientVitalSignsFilters,
  vitalSignsQueries,
} from "@/modules/medical-records/queries/vital-signs.query"

export function useVitalSignsForAppointmentQuery(appointmentId: string) {
  return useQuery(vitalSignsQueries.forAppointment(appointmentId))
}

export function usePatientVitalSignsQuery(
  filters: PatientVitalSignsFilters,
  enabled = true,
) {
  return useQuery({
    ...vitalSignsQueries.patientHistory(filters),
    enabled: enabled && Boolean(filters.patientId),
  })
}
