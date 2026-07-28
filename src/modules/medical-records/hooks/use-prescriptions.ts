"use client"

import { useQuery } from "@tanstack/react-query"

import {
  prescriptionsQueries,
  type PatientPrescriptionsFilters,
} from "@/modules/medical-records/queries/prescriptions.query"

export function useAppointmentPrescriptionsQuery(appointmentId: string) {
  return useQuery(prescriptionsQueries.forAppointment(appointmentId))
}

export function usePatientPrescriptionsQuery(
  filters: PatientPrescriptionsFilters,
  enabled = true,
) {
  return useQuery({
    ...prescriptionsQueries.patientHistory(filters),
    enabled: enabled && Boolean(filters.patientId),
  })
}

export function usePrescriptionQuery(id: string, enabled = true) {
  return useQuery({
    ...prescriptionsQueries.detail(id),
    enabled: enabled && Boolean(id),
  })
}

export function usePrescriptionRenderedQuery(id: string, enabled = true) {
  return useQuery({
    ...prescriptionsQueries.rendered(id),
    enabled: enabled && Boolean(id),
  })
}

export function usePrescriptionLayoutsQuery(enabled = true) {
  return useQuery({
    ...prescriptionsQueries.layouts(),
    enabled,
  })
}
