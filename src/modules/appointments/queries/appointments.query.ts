import { queryOptions } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"

import { countAppointmentsAction } from "@/modules/appointments/actions/count-appointments"
import { getAppointmentAction } from "@/modules/appointments/actions/get-appointment"
import { getAttendanceBootstrapAction } from "@/modules/appointments/actions/get-attendance-bootstrap"
import { getCalendarClinicHoursAction } from "@/modules/appointments/actions/get-calendar-clinic-hours"
import { getCalendarRangeAction } from "@/modules/appointments/actions/get-calendar-range"
import { getOwnProfessionalIdAction } from "@/modules/appointments/actions/get-own-professional-id"
import { listAppointmentsAction } from "@/modules/appointments/actions/list-appointments"
import { listPatientAppointmentsAction } from "@/modules/appointments/actions/list-patient-appointments"
import type { AttendanceBootstrap } from "@/modules/appointments/types/attendance-bootstrap"
import type { CalendarRange } from "@/modules/appointments/types/calendar-range"
import {
  reviveAppointment,
  reviveScheduleBlock,
} from "@/modules/appointments/utils/revive-appointment"
import { clinicalNotesQueryKeys } from "@/modules/medical-records/queries/clinical-notes.query"
import type { ClinicalNote } from "@/modules/medical-records/types/clinical-note"
import { vitalSignsQueryKeys } from "@/modules/medical-records/queries/vital-signs.query"
import type {
  VitalSigns,
  VitalSignsForAppointment,
} from "@/modules/medical-records/types/vital-signs"
import { patientsQueryKeys } from "@/modules/patients/queries/patients.query"
import type { Patient } from "@/modules/patients/types/patient"
import { unwrapActionResult } from "@/shared/errors"

export type AppointmentsRangeFilters = {
  from: Date
  to: Date
  professionalIds?: string[]
  patientIds?: string[]
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

export type CalendarRangeFilters = AppointmentsRangeFilters & {
  includeHours?: boolean
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
        patientIds: filters.patientIds?.length
          ? [...filters.patientIds].sort()
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
  calendarRanges: () =>
    [...appointmentsQueryKeys.all, "calendar-range"] as const,
  calendarRange: (filters: CalendarRangeFilters) =>
    [
      ...appointmentsQueryKeys.calendarRanges(),
      {
        from: filters.from.toISOString(),
        to: filters.to.toISOString(),
        professionalIds: filters.professionalIds?.length
          ? [...filters.professionalIds].sort()
          : undefined,
        patientIds: filters.patientIds?.length
          ? [...filters.patientIds].sort()
          : undefined,
        modality: filters.modality,
        includeHours: filters.includeHours ?? false,
      },
    ] as const,
  attendanceBootstraps: () =>
    [...appointmentsQueryKeys.all, "attendance-bootstrap"] as const,
  attendanceBootstrap: (appointmentId: string) =>
    [...appointmentsQueryKeys.attendanceBootstraps(), appointmentId] as const,
  ownProfessionalId: () =>
    [...appointmentsQueryKeys.all, "own-professional-id"] as const,
}

function revivePatient(row: Patient): Patient {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

function reviveVitalSigns(row: VitalSigns): VitalSigns {
  return {
    ...row,
    appointmentStartsAt: row.appointmentStartsAt
      ? new Date(row.appointmentStartsAt)
      : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

function reviveVitalSignsForAppointment(
  row: VitalSignsForAppointment,
): VitalSignsForAppointment {
  return {
    ...row,
    vitals: row.vitals ? reviveVitalSigns(row.vitals) : null,
  }
}

function reviveClinicalNote(row: ClinicalNote): ClinicalNote {
  return {
    ...row,
    appointmentStartsAt: row.appointmentStartsAt
      ? new Date(row.appointmentStartsAt)
      : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

function reviveCalendarRange(data: CalendarRange): CalendarRange {
  return {
    appointments: data.appointments.map(reviveAppointment),
    scheduleBlocks: data.scheduleBlocks.map(reviveScheduleBlock),
    weeklyHours: data.weeklyHours,
  }
}

function reviveAttendanceBootstrap(
  data: AttendanceBootstrap,
): AttendanceBootstrap {
  return {
    appointment: reviveAppointment(data.appointment),
    patient: revivePatient(data.patient),
    currentVitals: reviveVitalSignsForAppointment(data.currentVitals),
    previousVitals: data.previousVitals.map(reviveVitalSigns),
    previousNotes: data.previousNotes.map(reviveClinicalNote),
  }
}

function seedAttendanceBootstrap(
  client: QueryClient,
  data: AttendanceBootstrap,
) {
  const historyFilters = {
    patientId: data.appointment.patientId,
    excludeAppointmentId: data.appointment.id,
  }

  client.setQueryData(
    appointmentsQueryKeys.detail(data.appointment.id),
    data.appointment,
  )
  client.setQueryData(patientsQueryKeys.detail(data.patient.id), data.patient)
  client.setQueryData(
    vitalSignsQueryKeys.forAppointment(data.appointment.id),
    data.currentVitals,
  )
  client.setQueryData(
    vitalSignsQueryKeys.patientHistory(historyFilters),
    data.previousVitals,
  )
  client.setQueryData(
    clinicalNotesQueryKeys.patientHistory(historyFilters),
    data.previousNotes,
  )
}

export const appointmentsQueries = {
  list: (filters: AppointmentsRangeFilters) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.list(filters),
      queryFn: async () =>
        unwrapActionResult(await listAppointmentsAction(filters)).map(
          reviveAppointment,
        ),
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
        unwrapActionResult(await listPatientAppointmentsAction(filters)).map(
          reviveAppointment,
        ),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.detail(id),
      queryFn: async () =>
        reviveAppointment(unwrapActionResult(await getAppointmentAction(id))),
    }),

  calendarHours: () =>
    queryOptions({
      queryKey: appointmentsQueryKeys.calendarHours(),
      queryFn: async () =>
        unwrapActionResult(await getCalendarClinicHoursAction()),
    }),

  calendarRange: (filters: CalendarRangeFilters) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.calendarRange(filters),
      queryFn: async () =>
        reviveCalendarRange(
          unwrapActionResult(await getCalendarRangeAction(filters)),
        ),
    }),

  attendanceBootstrap: (appointmentId: string) =>
    queryOptions({
      queryKey: appointmentsQueryKeys.attendanceBootstrap(appointmentId),
      queryFn: async ({ client }) => {
        const data = reviveAttendanceBootstrap(
          unwrapActionResult(
            await getAttendanceBootstrapAction(appointmentId),
          ),
        )
        seedAttendanceBootstrap(client, data)
        return data
      },
    }),

  ownProfessionalId: () =>
    queryOptions({
      queryKey: appointmentsQueryKeys.ownProfessionalId(),
      queryFn: async () =>
        unwrapActionResult(await getOwnProfessionalIdAction()),
    }),
}
