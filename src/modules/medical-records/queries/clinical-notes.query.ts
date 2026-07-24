import { queryOptions } from "@tanstack/react-query"

import { getClinicalNoteForAppointmentAction } from "@/modules/medical-records/actions/get-clinical-note-for-appointment"
import { listPatientClinicalNotesAction } from "@/modules/medical-records/actions/list-patient-clinical-notes"
import { unwrapActionResult } from "@/shared/errors"

export type PatientClinicalNotesFilters = {
  patientId: string
  excludeAppointmentId?: string
}

export const clinicalNotesQueryKeys = {
  all: ["clinical-notes"] as const,
  forAppointment: (appointmentId: string) =>
    [...clinicalNotesQueryKeys.all, "appointment", appointmentId] as const,
  patientHistories: () => [...clinicalNotesQueryKeys.all, "history"] as const,
  patientHistory: (filters: PatientClinicalNotesFilters) =>
    [...clinicalNotesQueryKeys.patientHistories(), filters] as const,
}

export const clinicalNotesQueries = {
  forAppointment: (appointmentId: string) =>
    queryOptions({
      queryKey: clinicalNotesQueryKeys.forAppointment(appointmentId),
      queryFn: async () =>
        unwrapActionResult(
          await getClinicalNoteForAppointmentAction(appointmentId),
        ),
    }),

  patientHistory: (filters: PatientClinicalNotesFilters) =>
    queryOptions({
      queryKey: clinicalNotesQueryKeys.patientHistory(filters),
      queryFn: async () =>
        unwrapActionResult(await listPatientClinicalNotesAction(filters)),
    }),
}
