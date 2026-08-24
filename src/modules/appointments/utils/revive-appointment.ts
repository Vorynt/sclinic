import type { Appointment } from "@/modules/appointments/types/appointment"
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block"

export function reviveAppointment(row: Appointment): Appointment {
  return {
    ...row,
    startsAt: new Date(row.startsAt),
    endsAt: new Date(row.endsAt),
    canceledAt: row.canceledAt ? new Date(row.canceledAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

export function reviveScheduleBlock(row: ScheduleBlock): ScheduleBlock {
  return {
    ...row,
    startsAt: new Date(row.startsAt),
    endsAt: new Date(row.endsAt),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}
