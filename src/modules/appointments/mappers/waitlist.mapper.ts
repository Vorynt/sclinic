import type {
  WaitlistEntry,
  WaitlistStatus,
} from "@/modules/appointments/types/waitlist"

export type WaitlistRow = {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  professionalId: string | null
  professionalName: string | null
  serviceId: string | null
  serviceName: string | null
  status: string
  notes: string | null
  promotedAppointmentId: string | null
  createdAt: Date
  updatedAt: Date
}

const WAITLIST_STATUSES = new Set<WaitlistStatus>([
  "waiting",
  "promoted",
  "canceled",
])

function toWaitlistStatus(value: string): WaitlistStatus {
  return WAITLIST_STATUSES.has(value as WaitlistStatus)
    ? (value as WaitlistStatus)
    : "waiting"
}

export function toWaitlistEntry(row: WaitlistRow): WaitlistEntry {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    patientName: row.patientName,
    professionalId: row.professionalId,
    professionalName: row.professionalName,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    status: toWaitlistStatus(row.status),
    notes: row.notes,
    promotedAppointmentId: row.promotedAppointmentId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
