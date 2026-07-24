import type { ClinicBusinessHours as ClinicBusinessHoursRow } from "@/db/schema"
import type {
  ClinicDayHours,
  ClinicTimeInterval,
  ClinicWeeklyHours,
} from "@/modules/clinics/types/clinic-hours"

/** Normalize DB `time` (`HH:mm:ss` or `HH:mm`) to `HH:mm`. */
export function toClinicTime(value: string | null): string | null {
  if (!value) return null
  return value.slice(0, 5)
}

function toIntervals(row: ClinicBusinessHoursRow): ClinicTimeInterval[] {
  const opensAt = toClinicTime(row.opensAt)
  const closesAt = toClinicTime(row.closesAt)
  if (!opensAt || !closesAt) return []

  const intervals: ClinicTimeInterval[] = [{ opensAt, closesAt }]

  const secondOpensAt = toClinicTime(row.secondOpensAt)
  const secondClosesAt = toClinicTime(row.secondClosesAt)
  if (secondOpensAt && secondClosesAt) {
    intervals.push({ opensAt: secondOpensAt, closesAt: secondClosesAt })
  }

  return intervals
}

export function toClinicDayHours(row: ClinicBusinessHoursRow): ClinicDayHours {
  if (row.isClosed) {
    return {
      dayOfWeek: row.dayOfWeek,
      isClosed: true,
      intervals: [],
    }
  }

  return {
    dayOfWeek: row.dayOfWeek,
    isClosed: false,
    intervals: toIntervals(row),
  }
}

/** Builds a full week (0…6), filling missing days as closed. */
export function toClinicWeeklyHours(
  rows: ClinicBusinessHoursRow[],
): ClinicWeeklyHours {
  const byDay = new Map(rows.map((row) => [row.dayOfWeek, toClinicDayHours(row)]))

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    return (
      byDay.get(dayOfWeek) ?? {
        dayOfWeek,
        isClosed: true,
        intervals: [],
      }
    )
  })
}

export function toDbTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value
}
