/**
 * Domain appointment type exposed to actions / UI.
 * `patientName` / `professionalName` come from the repository join.
 */

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "canceled"
  | "no_show"

export type AppointmentType =
  | "consultation"
  | "follow_up"
  | "procedure"
  | "evaluation"
  | "other"

/** How the appointment is delivered (ADR-011). */
export type AppointmentModality = "in_person" | "online"

export type Appointment = {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  professionalId: string | null
  professionalName: string | null
  serviceId: string | null
  startsAt: Date
  endsAt: Date
  type: AppointmentType
  modality: AppointmentModality
  status: AppointmentStatus
  reason: string | null
  notes: string | null
  canceledAt: Date | null
  canceledReason: string | null
  createdAt: Date
  updatedAt: Date
}

/** Result of a bulk confirm operation on the reception day board. */
export type ConfirmAppointmentsBatchResult = {
  confirmedCount: number
  skippedCount: number
}
