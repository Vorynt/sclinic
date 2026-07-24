"use client"

import { useQuery } from "@tanstack/react-query"

import { vitalSignsQueries } from "@/modules/medical-records/queries/vital-signs.query"

export function useVitalSignsForAppointmentQuery(appointmentId: string) {
  return useQuery(vitalSignsQueries.forAppointment(appointmentId))
}

export function usePatientVitalSignsQuery(appointmentId: string) {
  return useQuery(vitalSignsQueries.patientHistory(appointmentId))
}
