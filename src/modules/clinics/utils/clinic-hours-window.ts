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

/** Wall-clock parts of `date` in `timeZone`. */
export function getZonedDayParts(
  date: Date,
  timeZone: string,
): { dayOfWeek: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date)

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun"
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0")
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  )

  return {
    dayOfWeek: WEEKDAY_TO_DOW[weekday] ?? 0,
    minutes: hour * 60 + minute,
  }
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
