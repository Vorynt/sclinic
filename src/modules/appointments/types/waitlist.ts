/**
 * Waiting queue entry for a free slot (ADR-011).
 * Does not reserve a slot until promote → appointment create.
 */

export type WaitlistStatus = "waiting" | "promoted" | "canceled"

export type WaitlistEntry = {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  professionalId: string | null
  professionalName: string | null
  serviceId: string | null
  serviceName: string | null
  status: WaitlistStatus
  notes: string | null
  promotedAppointmentId: string | null
  createdAt: Date
  updatedAt: Date
}
