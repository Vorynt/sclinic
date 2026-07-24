"use client"

import { useQuery } from "@tanstack/react-query"

import { clinicalNotesQueries } from "@/modules/medical-records/queries/clinical-notes.query"

export function useClinicalNoteForAppointmentQuery(appointmentId: string) {
  return useQuery(clinicalNotesQueries.forAppointment(appointmentId))
}

export function usePatientClinicalNotesQuery(appointmentId: string) {
  return useQuery(clinicalNotesQueries.patientHistory(appointmentId))
}
