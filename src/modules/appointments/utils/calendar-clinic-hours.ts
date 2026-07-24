import { CALENDAR_HOUR_RANGE } from "@/modules/appointments/utils/calendar-constants"
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"
import {
  getDayHours,
  getMinuteIntervalsForDay,
  type MinuteInterval,
  timeToMinutes,
} from "@/modules/clinics/utils/clinic-hours-window"

export type CalendarHourRange = {
  /** Inclusive start hour (0–23). */
  start: number
  /** Exclusive end hour (1–24). */
  end: number
}

/**
 * Visible grid range from clinic hours for the given calendar days.
 * Falls back to `CALENDAR_HOUR_RANGE` when every day is closed / empty.
 */
export function resolveVisibleHourRange(
  weeklyHours: ClinicWeeklyHours,
  days: Date[],
): CalendarHourRange {
  let minStartMinutes = Number.POSITIVE_INFINITY
  let maxEndMinutes = Number.NEGATIVE_INFINITY

  for (const day of days) {
    const intervals = getMinuteIntervalsForDay(weeklyHours, day.getDay())
    for (const interval of intervals) {
      minStartMinutes = Math.min(minStartMinutes, interval.startMinutes)
      maxEndMinutes = Math.max(maxEndMinutes, interval.endMinutes)
    }
  }

  if (
    !Number.isFinite(minStartMinutes) ||
    !Number.isFinite(maxEndMinutes) ||
    maxEndMinutes <= minStartMinutes
  ) {
    return { start: CALENDAR_HOUR_RANGE.start, end: CALENDAR_HOUR_RANGE.end }
  }

  const start = Math.floor(minStartMinutes / 60)
  const end = Math.max(Math.ceil(maxEndMinutes / 60), start + 1)

  return { start, end }
}

/**
 * Closed / break segments inside the visible grid (minutes from midnight).
 * Includes before open, lunch/interval gaps, after close, and full-day when closed.
 */
export function getUnavailableMinuteRanges(
  weeklyHours: ClinicWeeklyHours,
  day: Date,
  hourRange: CalendarHourRange,
): MinuteInterval[] {
  const gridStart = hourRange.start * 60
  const gridEnd = hourRange.end * 60
  const openIntervals = getMinuteIntervalsForDay(weeklyHours, day.getDay())

  if (openIntervals.length === 0) {
    return [{ startMinutes: gridStart, endMinutes: gridEnd }]
  }

  const unavailable: MinuteInterval[] = []
  let cursor = gridStart

  for (const interval of openIntervals) {
    const openStart = Math.max(interval.startMinutes, gridStart)
    const openEnd = Math.min(interval.endMinutes, gridEnd)

    if (openEnd <= openStart) {
      continue
    }

    if (openStart > cursor) {
      unavailable.push({ startMinutes: cursor, endMinutes: openStart })
    }

    cursor = Math.max(cursor, openEnd)
  }

  if (cursor < gridEnd) {
    unavailable.push({ startMinutes: cursor, endMinutes: gridEnd })
  }

  return unavailable.filter(
    (range) => range.endMinutes > range.startMinutes,
  )
}

/** True when `minutesFromMidnight` falls inside an open clinic interval that day. */
export function isWithinOpenClinicMinutes(
  weeklyHours: ClinicWeeklyHours,
  day: Date,
  minutesFromMidnight: number,
): boolean {
  const dayHours = getDayHours(weeklyHours, day.getDay())
  if (dayHours.isClosed || dayHours.intervals.length === 0) {
    return false
  }

  return dayHours.intervals.some((interval) => {
    const start = timeToMinutes(interval.opensAt)
    const end = timeToMinutes(interval.closesAt)
    return minutesFromMidnight >= start && minutesFromMidnight < end
  })
}
