import { queryOptions } from "@tanstack/react-query"

import { countAppointmentsAction } from "@/modules/appointments/actions/count-appointments"
import { getAppointmentAction } from "@/modules/appointments/actions/get-appointment"
import { getCalendarClinicHoursAction } from "@/modules/appointments/actions/get-calendar-clinic-hours"
import { listAppointmentsAction } from "@/modules/appointments/actions/list-appointments"
import { listPatientAppointmentsAction } from "@/modules/appointments/actions/list-patient-appointments"
import { unwrapActionResult } from "@/shared/errors"

export type AppointmentsRangeFilters = {
  from: Date
  to: Date
  professionalIds?: string[]
  modality?: "in_person" | "online"
}

export type AppointmentsCountFilters = {
  from: Date
  to: Date
  excludeCanceled?: boolean
}

export type PatientAppointmentsFilters = {
  patientId: string
  excludeAppointmentId?: string
  limit?: number
}

export const appointmentsQueryKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentsQueryKeys.all, "list"] as const,
  list: (filters: AppointmentsRangeFilters) =>
    [
      ...appointmentsQueryKeys.lists(),
      {
        from: filters.from.toISOString(),
        to: filters.to.toISOString(),
        professionalIds: filters.professionalIds?.length
          ? [...filters.professionalIds].sort()
          : undefined,
        modality: filters.modality,
      },
    ] as const,
  counts: () => [...appointmentsQueryKeys.all, "count"] as const,
  count: (filters: AppointmentsCountFilters) =>
    [
      ...appointmentsQueryKeys.counts(),
      {
        from: filters.from.toISOString(),
        to: filters.to.toISOString(),
        excludeCanceled: filters.excludeCanceled ?? true,
      },
    ] as const,
  patientLists: () => [...appointmentsQueryKeys.all, "patient"] as const,
  patientList: (filters: PatientAppointmentsFilters) =>
    [...appointmentsQueryKeys.patientLists(), filters] as const,
  details: () => [...appointmentsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...appointmentsQueryKeys.details(), id] as const,
  calendarHours: () =>
    [...appointmentsQueryKeys.all, "calendar-hours"] as const,
}

export const appointmentsQueries = {
  list: (filters: AppointmentsRangeFilters) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.list(filters),
      queryFn: async () =>
        unwrapActionResult(await listAppointmentsAction(filters)),
    }),

  count: (filters: AppointmentsCountFilters) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.count(filters),
      queryFn: async () =>
        unwrapActionResult(await countAppointmentsAction(filters)),
    }),

  patientList: (filters: PatientAppointmentsFilters) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.patientList(filters),
      queryFn: async () =>
        unwrapActionResult(await listPatientAppointmentsAction(filters)),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.detail(id),
      queryFn: async () => unwrapActionResult(await getAppointmentAction(id)),
    }),

  calendarHours: () =>
    queryOptions({
      queryKey: appointmentsQueryKeys.calendarHours(),
      queryFn: async () =>
        unwrapActionResult(await getCalendarClinicHoursAction()),
    }),
}
