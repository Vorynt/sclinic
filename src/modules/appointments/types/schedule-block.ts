/**
 * Domain schedule block (punctual unavailability — ADR-011).
 * `professionalId` null = clinic-wide.
 */

export type ScheduleBlock = {
  id: string
  clinicId: string
  professionalId: string | null
  professionalName: string | null
  startsAt: Date
  endsAt: Date
  reason: string | null
  createdAt: Date
  updatedAt: Date
}

export function isClinicWideScheduleBlock(
  block: Pick<ScheduleBlock, "professionalId">,
): boolean {
  return block.professionalId == null
}
