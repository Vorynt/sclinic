import { format } from "date-fns"

import {
  APPOINTMENT_MODALITY_LABELS,
  APPOINTMENT_TYPE_LABELS,
  isSelfScheduleOnlyRole,
} from "@/modules/appointments/constants/appointments"
import type { Appointment } from "@/modules/appointments/types/appointment"
import type {
  CalendarCardPreset,
  CalendarSettingsPresetKey,
  ClinicCalendarSettings,
} from "@/modules/clinics/types/clinic-calendar-settings"

export function resolveCalendarSettingsPreset(
  roleKey: string | null | undefined,
): CalendarSettingsPresetKey {
  return isSelfScheduleOnlyRole(roleKey) ? "clinical" : "operations"
}

export function resolveCalendarCardFields(
  settings: ClinicCalendarSettings,
  preset: CalendarSettingsPresetKey,
): CalendarCardPreset {
  return settings.cardPresets[preset]
}

export type AppointmentCardField = {
  id: string
  label: string
  value: string
}

export function formatAppointmentTimeRange(appointment: Appointment): string {
  return `${format(appointment.startsAt, "HH:mm")}–${format(appointment.endsAt, "HH:mm")}`
}

export function formatAppointmentStartTime(appointment: Appointment): string {
  return format(appointment.startsAt, "HH:mm")
}

/** Extra fields shown in the slot when the card is tall enough. */
export function getAppointmentCardExtraFields(
  appointment: Appointment,
  preset: CalendarCardPreset,
): AppointmentCardField[] {
  const fields: AppointmentCardField[] = []

  if (preset.showProfessional && appointment.professionalName) {
    fields.push({
      id: "professional",
      label: "Profissional",
      value: appointment.professionalName,
    })
  }
  if (preset.showType) {
    fields.push({
      id: "type",
      label: "Tipo",
      value: APPOINTMENT_TYPE_LABELS[appointment.type],
    })
  }
  if (preset.showService && appointment.serviceName) {
    fields.push({
      id: "service",
      label: "Serviço",
      value: appointment.serviceName,
    })
  }
  if (preset.showModality) {
    fields.push({
      id: "modality",
      label: "Modalidade",
      value: APPOINTMENT_MODALITY_LABELS[appointment.modality],
    })
  }
  if (preset.showReason && appointment.reason) {
    fields.push({
      id: "reason",
      label: "Motivo",
      value: appointment.reason,
    })
  }

  return fields
}

export function filterVisibleCalendarAppointments(
  appointments: Appointment[],
  showCanceled: boolean,
): Appointment[] {
  if (showCanceled) return appointments
  return appointments.filter((appointment) => appointment.status !== "canceled")
}
