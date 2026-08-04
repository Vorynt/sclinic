/**
 * Domain schedule block (punctual unavailability — ADR-011).
 */

export type ScheduleBlock = {
  id: string
  clinicId: string
  professionalId: string
  professionalName: string | null
  startsAt: Date
  endsAt: Date
  reason: string | null
  createdAt: Date
  updatedAt: Date
}
