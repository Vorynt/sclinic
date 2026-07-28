import { queryOptions } from "@tanstack/react-query"

import { getPrescriptionAction } from "@/modules/medical-records/actions/get-prescription"
import { getPrescriptionLayoutAction } from "@/modules/medical-records/actions/get-prescription-layout"
import { getPrescriptionRenderedHtmlAction } from "@/modules/medical-records/actions/get-prescription-rendered-html"
import { listAppointmentPrescriptionsAction } from "@/modules/medical-records/actions/list-appointment-prescriptions"
import { listPatientPrescriptionsAction } from "@/modules/medical-records/actions/list-patient-prescriptions"
import { unwrapActionResult } from "@/shared/errors"

export type PatientPrescriptionsFilters = {
  patientId: string
  excludeAppointmentId?: string
}

export const prescriptionsQueryKeys = {
  all: ["prescriptions"] as const,
  forAppointment: (appointmentId: string) =>
    [...prescriptionsQueryKeys.all, "appointment", appointmentId] as const,
  patientHistories: () =>
    [...prescriptionsQueryKeys.all, "history"] as const,
  patientHistory: (filters: PatientPrescriptionsFilters) =>
    [...prescriptionsQueryKeys.patientHistories(), filters] as const,
  detail: (id: string) =>
    [...prescriptionsQueryKeys.all, "detail", id] as const,
  rendered: (id: string) =>
    [...prescriptionsQueryKeys.all, "rendered", id] as const,
  layout: () => [...prescriptionsQueryKeys.all, "layout"] as const,
}

export const prescriptionsQueries = {
  forAppointment: (appointmentId: string) =>
    queryOptions({
      queryKey: prescriptionsQueryKeys.forAppointment(appointmentId),
      queryFn: async () =>
        unwrapActionResult(
          await listAppointmentPrescriptionsAction({ appointmentId }),
        ),
    }),

  patientHistory: (filters: PatientPrescriptionsFilters) =>
    queryOptions({
      queryKey: prescriptionsQueryKeys.patientHistory(filters),
      queryFn: async () =>
        unwrapActionResult(await listPatientPrescriptionsAction(filters)),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: prescriptionsQueryKeys.detail(id),
      queryFn: async () =>
        unwrapActionResult(await getPrescriptionAction({ id })),
    }),

  rendered: (id: string) =>
    queryOptions({
      queryKey: prescriptionsQueryKeys.rendered(id),
      queryFn: async () =>
        unwrapActionResult(await getPrescriptionRenderedHtmlAction({ id })),
    }),

  layout: () =>
    queryOptions({
      queryKey: prescriptionsQueryKeys.layout(),
      queryFn: async () =>
        unwrapActionResult(await getPrescriptionLayoutAction()),
    }),
}
