import type {
  Appointment,
  AppointmentModality,
  AppointmentStatus,
  AppointmentType,
} from "@/modules/appointments/types/appointment"

/** Shape returned by the repository's joined appointment queries. */
export type AppointmentRow = {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  professionalId: string | null
  professionalName: string | null
  serviceId: string | null
  startsAt: Date
  endsAt: Date
  type: string
  modality: string
  status: string
  reason: string | null
  notes: string | null
  canceledAt: Date | null
  canceledReason: string | null
  createdAt: Date
  updatedAt: Date
}

const APPOINTMENT_STATUSES = new Set<AppointmentStatus>([
  "scheduled",
  "confirmed",
  "checked_in",
  "completed",
  "canceled",
  "no_show",
])

const APPOINTMENT_TYPES = new Set<AppointmentType>([
  "consultation",
  "follow_up",
  "procedure",
  "evaluation",
  "other",
])

const APPOINTMENT_MODALITIES = new Set<AppointmentModality>([
  "in_person",
  "online",
])

function toAppointmentStatus(value: string): AppointmentStatus {
  return APPOINTMENT_STATUSES.has(value as AppointmentStatus)
    ? (value as AppointmentStatus)
    : "scheduled"
}

function toAppointmentType(value: string): AppointmentType {
  return APPOINTMENT_TYPES.has(value as AppointmentType)
    ? (value as AppointmentType)
    : "consultation"
}

function toAppointmentModality(value: string): AppointmentModality {
  return APPOINTMENT_MODALITIES.has(value as AppointmentModality)
    ? (value as AppointmentModality)
    : "in_person"
}

export function toAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    patientName: row.patientName,
    professionalId: row.professionalId,
    professionalName: row.professionalName,
    serviceId: row.serviceId,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    type: toAppointmentType(row.type),
    modality: toAppointmentModality(row.modality),
    status: toAppointmentStatus(row.status),
    reason: row.reason,
    notes: row.notes,
    canceledAt: row.canceledAt,
    canceledReason: row.canceledReason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
