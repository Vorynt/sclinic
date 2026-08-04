import type {
  ClinicDayHours,
  ClinicTimeInterval,
  ClinicWeeklyHours,
} from "@/modules/clinics/types/clinic-hours"
import { DEFAULT_CLINIC_DAY_INTERVAL } from "@/modules/clinics/types/clinic-hours"

export type MinuteInterval = {
  startMinutes: number
  endMinutes: number
}

const WEEKDAY_TO_DOW: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

export function intervalsToMinutes(
  intervals: ClinicTimeInterval[],
): MinuteInterval[] {
  return intervals.map((interval) => ({
    startMinutes: timeToMinutes(interval.opensAt),
    endMinutes: timeToMinutes(interval.closesAt),
  }))
}

function readFormatParts(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Record<string, string> {
  const entries = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    ...options,
  })
    .formatToParts(date)
    .filter((part) => part.type !== "literal")
    .map((part) => [part.type, part.value] as const)

  return Object.fromEntries(entries)
}

/** Wall-clock parts of `date` in `timeZone`. */
export function getZonedDayParts(
  date: Date,
  timeZone: string,
): { dayOfWeek: number; minutes: number } {
  const parts = readFormatParts(date, timeZone, {
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  })

  const weekday = parts.weekday ?? "Sun"
  const hour = Number(parts.hour ?? "0")
  const minute = Number(parts.minute ?? "0")

  return {
    dayOfWeek: WEEKDAY_TO_DOW[weekday] ?? 0,
    minutes: hour * 60 + minute,
  }
}

/** Full calendar + wall-clock parts of `date` in `timeZone`. */
export function getZonedDateTimeParts(
  date: Date,
  timeZone: string,
): {
  year: number
  month: number
  day: number
  dayOfWeek: number
  hour: number
  minute: number
  minutes: number
} {
  const parts = readFormatParts(date, timeZone, {
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })

  const hour = Number(parts.hour ?? "0")
  const minute = Number(parts.minute ?? "0")

  return {
    year: Number(parts.year ?? "0"),
    month: Number(parts.month ?? "1"),
    day: Number(parts.day ?? "1"),
    dayOfWeek: WEEKDAY_TO_DOW[parts.weekday ?? "Sun"] ?? 0,
    hour,
    minute,
    minutes: hour * 60 + minute,
  }
}

/**
 * Converts a wall-clock date/time in `timeZone` into the matching UTC `Date`.
 * Runs a second pass so DST transitions resolve to the correct offset.
 */
export function zonedWallTimeToUtc(params: {
  year: number
  month: number
  day: number
  hour?: number
  minute?: number
  timeZone: string
}): Date {
  const hour = params.hour ?? 0
  const minute = params.minute ?? 0
  const asUtcMs = Date.UTC(
    params.year,
    params.month - 1,
    params.day,
    hour,
    minute,
    0,
    0,
  )

  const offsetFor = (instant: Date): number => {
    const parts = getZonedDateTimeParts(instant, params.timeZone)
    const asIfUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      0,
      0,
    )
    return asIfUtc - instant.getTime()
  }

  let instant = new Date(asUtcMs)
  instant = new Date(asUtcMs - offsetFor(instant))
  const refinedOffset = offsetFor(instant)
  const refined = new Date(asUtcMs - refinedOffset)
  if (refined.getTime() !== instant.getTime()) {
    instant = refined
  }

  return instant
}

/** Adds calendar days in `timeZone` and returns midnight (00:00) that day. */
export function addZonedCalendarDays(
  date: Date,
  days: number,
  timeZone: string,
): Date {
  const parts = getZonedDateTimeParts(date, timeZone)
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days))
  return zonedWallTimeToUtc({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: 0,
    minute: 0,
    timeZone,
  })
}

/** True when both instants fall on the same calendar day in `timeZone`. */
export function isSameZonedDay(
  left: Date,
  right: Date,
  timeZone: string,
): boolean {
  const a = getZonedDateTimeParts(left, timeZone)
  const b = getZonedDateTimeParts(right, timeZone)
  return a.year === b.year && a.month === b.month && a.day === b.day
}

export function getDayHours(
  weeklyHours: ClinicWeeklyHours,
  dayOfWeek: number,
): ClinicDayHours {
  return (
    weeklyHours.find((day) => day.dayOfWeek === dayOfWeek) ?? {
      dayOfWeek,
      isClosed: true,
      intervals: [],
    }
  )
}

/** Fallback week (7h–19h) when the clinic has not configured hours yet. */
export function buildFallbackWeeklyHours(): ClinicWeeklyHours {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: false,
    intervals: [{ ...DEFAULT_CLINIC_DAY_INTERVAL }],
  }))
}

export function isWithinClinicHours(params: {
  startsAt: Date
  endsAt: Date
  weeklyHours: ClinicWeeklyHours
  timeZone: string
}): boolean {
  const start = getZonedDayParts(params.startsAt, params.timeZone)
  const end = getZonedDayParts(params.endsAt, params.timeZone)

  if (start.dayOfWeek !== end.dayOfWeek) {
    return false
  }

  if (end.minutes < start.minutes) {
    return false
  }

  const day = getDayHours(params.weeklyHours, start.dayOfWeek)
  if (day.isClosed || day.intervals.length === 0) {
    return false
  }

  const intervals = intervalsToMinutes(day.intervals)
  return intervals.some(
    (interval) =>
      start.minutes >= interval.startMinutes &&
      end.minutes <= interval.endMinutes,
  )
}

export function getMinuteIntervalsForDay(
  weeklyHours: ClinicWeeklyHours,
  dayOfWeek: number,
): MinuteInterval[] {
  const day = getDayHours(weeklyHours, dayOfWeek)
  if (day.isClosed) return []
  return intervalsToMinutes(day.intervals)
}
