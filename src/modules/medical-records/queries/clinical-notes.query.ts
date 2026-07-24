import { queryOptions } from "@tanstack/react-query"

import { getClinicalNoteForAppointmentAction } from "@/modules/medical-records/actions/get-clinical-note-for-appointment"
import { listPatientClinicalNotesAction } from "@/modules/medical-records/actions/list-patient-clinical-notes"
import { unwrapActionResult } from "@/shared/errors"

export const clinicalNotesQueryKeys = {
  all: ["clinical-notes"] as const,
  forAppointment: (appointmentId: string) =>
    [...clinicalNotesQueryKeys.all, "appointment", appointmentId] as const,
  patientHistory: (appointmentId: string) =>
    [...clinicalNotesQueryKeys.all, "history", appointmentId] as const,
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

  patientHistory: (appointmentId: string) =>
    queryOptions({
      queryKey: clinicalNotesQueryKeys.patientHistory(appointmentId),
      queryFn: async () =>
        unwrapActionResult(
          await listPatientClinicalNotesAction({ appointmentId }),
        ),
    }),
}
