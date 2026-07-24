import { queryOptions } from "@tanstack/react-query"

import { getVitalSignsForAppointmentAction } from "@/modules/medical-records/actions/get-vital-signs-for-appointment"
import { listPatientVitalSignsAction } from "@/modules/medical-records/actions/list-patient-vital-signs"
import { unwrapActionResult } from "@/shared/errors"

export type PatientVitalSignsFilters = {
  patientId: string
  excludeAppointmentId?: string
}

export const vitalSignsQueryKeys = {
  all: ["vital-signs"] as const,
  forAppointment: (appointmentId: string) =>
    [...vitalSignsQueryKeys.all, "appointment", appointmentId] as const,
  patientHistories: () => [...vitalSignsQueryKeys.all, "history"] as const,
  patientHistory: (filters: PatientVitalSignsFilters) =>
    [...vitalSignsQueryKeys.patientHistories(), filters] as const,
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

  patientHistory: (filters: PatientVitalSignsFilters) =>
    queryOptions({
      queryKey: vitalSignsQueryKeys.patientHistory(filters),
      queryFn: async () =>
        unwrapActionResult(await listPatientVitalSignsAction(filters)),
    }),
}
