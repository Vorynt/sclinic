import { queryOptions } from "@tanstack/react-query"

import { getVitalSignsForAppointmentAction } from "@/modules/medical-records/actions/get-vital-signs-for-appointment"
import { listPatientVitalSignsAction } from "@/modules/medical-records/actions/list-patient-vital-signs"
import { unwrapActionResult } from "@/shared/errors"

export const vitalSignsQueryKeys = {
  all: ["vital-signs"] as const,
  forAppointment: (appointmentId: string) =>
    [...vitalSignsQueryKeys.all, "appointment", appointmentId] as const,
  patientHistory: (appointmentId: string) =>
    [...vitalSignsQueryKeys.all, "history", appointmentId] as const,
}

export const vitalSignsQueries = {
  forAppointment: (appointmentId: string) =>
    queryOptions({
      queryKey: vitalSignsQueryKeys.forAppointment(appointmentId),
      queryFn: async () =>
        unwrapActionResult(
          await getVitalSignsForAppointmentAction(appointmentId),
        ),
    }),

  patientHistory: (appointmentId: string) =>
    queryOptions({
      queryKey: vitalSignsQueryKeys.patientHistory(appointmentId),
      queryFn: async () =>
        unwrapActionResult(
          await listPatientVitalSignsAction({ appointmentId }),
        ),
    }),
}
