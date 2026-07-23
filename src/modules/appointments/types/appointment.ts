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

export type Appointment = {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  professionalId: string | null
  professionalName: string | null
  startsAt: Date
  endsAt: Date
  type: AppointmentType
  status: AppointmentStatus
  reason: string | null
  notes: string | null
  canceledAt: Date | null
  canceledReason: string | null
  createdAt: Date
  updatedAt: Date
}
