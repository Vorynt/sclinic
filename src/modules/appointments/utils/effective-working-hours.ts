import type {
  ClinicTimeInterval,
  ClinicWeeklyHours,
} from "@/modules/clinics/types/clinic-hours"
import {
  getMinuteIntervalsForDay,
  type MinuteInterval,
  timeToMinutes,
} from "@/modules/clinics/utils/clinic-hours-window"

/** Intersect two sorted minute-interval lists. */
export function intersectMinuteIntervals(
  left: MinuteInterval[],
  right: MinuteInterval[],
): MinuteInterval[] {
  const result: MinuteInterval[] = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    const a = left[i]!
    const b = right[j]!
    const start = Math.max(a.startMinutes, b.startMinutes)
    const end = Math.min(a.endMinutes, b.endMinutes)
    if (start < end) {
      result.push({ startMinutes: start, endMinutes: end })
    }
    if (a.endMinutes < b.endMinutes) {
      i += 1
    } else {
      j += 1
    }
  }
  return result
}

function intervalsFromWeekly(
  weekly: ClinicWeeklyHours,
  dayOfWeek: number,
): MinuteInterval[] {
  return getMinuteIntervalsForDay(weekly, dayOfWeek)
}

/**
 * Effective working windows for a day = clinic ∩ professional.
 * When `professionalHours` is null, returns clinic intervals only.
 */
export function getEffectiveMinuteIntervals(params: {
  clinicHours: ClinicWeeklyHours
  professionalHours: ClinicWeeklyHours | null
  dayOfWeek: number
}): MinuteInterval[] {
  const clinic = intervalsFromWeekly(params.clinicHours, params.dayOfWeek)
  if (!params.professionalHours) {
    return clinic
  }
  const professional = intervalsFromWeekly(
    params.professionalHours,
    params.dayOfWeek,
  )
  return intersectMinuteIntervals(clinic, professional)
}

/** Rebuild ClinicWeeklyHours from effective intervals (for grid shading). */
export function toEffectiveWeeklyHours(
  clinicHours: ClinicWeeklyHours,
  professionalHours: ClinicWeeklyHours | null,
): ClinicWeeklyHours {
  if (!professionalHours) return clinicHours

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const intervals = getEffectiveMinuteIntervals({
      clinicHours,
      professionalHours,
      dayOfWeek,
    })
    if (intervals.length === 0) {
      return { dayOfWeek, isClosed: true, intervals: [] }
    }
    const mapped: ClinicTimeInterval[] = intervals.map((interval) => ({
      opensAt: minutesToHhMm(interval.startMinutes),
      closesAt: minutesToHhMm(interval.endMinutes),
    }))
    return { dayOfWeek, isClosed: false, intervals: mapped }
  })
}

function minutesToHhMm(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function isWithinEffectiveHours(params: {
  startsAt: Date
  endsAt: Date
  clinicHours: ClinicWeeklyHours
  professionalHours: ClinicWeeklyHours | null
  timeZone: string
  getZonedDayParts: (
    date: Date,
    timeZone: string,
  ) => { dayOfWeek: number; minutes: number }
}): boolean {
  const start = params.getZonedDayParts(params.startsAt, params.timeZone)
  const end = params.getZonedDayParts(params.endsAt, params.timeZone)
  if (start.dayOfWeek !== end.dayOfWeek) return false
  if (end.minutes < start.minutes) return false

  const intervals = getEffectiveMinuteIntervals({
    clinicHours: params.clinicHours,
    professionalHours: params.professionalHours,
    dayOfWeek: start.dayOfWeek,
  })

  return intervals.some(
    (interval) =>
      start.minutes >= interval.startMinutes &&
      end.minutes <= interval.endMinutes,
  )
}

export { timeToMinutes }
