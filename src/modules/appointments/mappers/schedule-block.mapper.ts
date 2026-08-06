import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block"

export type ScheduleBlockRow = {
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

export function toScheduleBlock(row: ScheduleBlockRow): ScheduleBlock {
  return {
    id: row.id,
    clinicId: row.clinicId,
    professionalId: row.professionalId,
    professionalName: row.professionalName,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    reason: row.reason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
