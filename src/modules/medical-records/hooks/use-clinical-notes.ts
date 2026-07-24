"use client"

import { useQuery } from "@tanstack/react-query"

import {
  clinicalNotesQueries,
  type PatientClinicalNotesFilters,
} from "@/modules/medical-records/queries/clinical-notes.query"

export function useClinicalNoteForAppointmentQuery(appointmentId: string) {
  return useQuery(clinicalNotesQueries.forAppointment(appointmentId))
}

export function usePatientClinicalNotesQuery(
  filters: PatientClinicalNotesFilters,
  enabled = true,
) {
  return useQuery({
    ...clinicalNotesQueries.patientHistory(filters),
    enabled: enabled && Boolean(filters.patientId),
  })
}
