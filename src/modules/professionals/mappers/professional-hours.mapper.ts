import type { ProfessionalBusinessHours as ProfessionalBusinessHoursRow } from "@/db/schema"
import type {
  ProfessionalDayHours,
  ProfessionalTimeInterval,
  ProfessionalWeeklyHours,
} from "@/modules/professionals/types/professional-hours"

/** Normalize DB `time` (`HH:mm:ss` or `HH:mm`) to `HH:mm`. */
export function toProfessionalTime(value: string | null): string | null {
  if (!value) return null
  return value.slice(0, 5)
}

function toIntervals(
  row: ProfessionalBusinessHoursRow,
): ProfessionalTimeInterval[] {
  const opensAt = toProfessionalTime(row.opensAt)
  const closesAt = toProfessionalTime(row.closesAt)
  if (!opensAt || !closesAt) return []

  const intervals: ProfessionalTimeInterval[] = [{ opensAt, closesAt }]

  const secondOpensAt = toProfessionalTime(row.secondOpensAt)
  const secondClosesAt = toProfessionalTime(row.secondClosesAt)
  if (secondOpensAt && secondClosesAt) {
    intervals.push({ opensAt: secondOpensAt, closesAt: secondClosesAt })
  }

  return intervals
}

export function toProfessionalDayHours(
  row: ProfessionalBusinessHoursRow,
): ProfessionalDayHours {
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
export function toProfessionalWeeklyHours(
  rows: ProfessionalBusinessHoursRow[],
): ProfessionalWeeklyHours {
  const byDay = new Map(
    rows.map((row) => [row.dayOfWeek, toProfessionalDayHours(row)]),
  )

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
