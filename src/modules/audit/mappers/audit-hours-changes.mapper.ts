import {
  DAY_OF_WEEK_DISPLAY_ORDER,
  DAY_OF_WEEK_SHORT_PT,
} from "@/modules/clinics/types/clinic-hours"

type ClinicTimeIntervalLike = {
  opensAt: string
  closesAt: string
}

export type ClinicDayHoursLike = {
  dayOfWeek: number
  isClosed: boolean
  intervals: ClinicTimeIntervalLike[]
}

export type ClinicHoursDayDiff = {
  dayOfWeek: number
  dayLabel: string
  beforeLabel: string
  afterLabel: string
}

function isInterval(value: unknown): value is ClinicTimeIntervalLike {
  if (!value || typeof value !== "object") return false
  const interval = value as Record<string, unknown>
  return (
    typeof interval.opensAt === "string" &&
    typeof interval.closesAt === "string"
  )
}

function isDayHours(value: unknown): value is ClinicDayHoursLike {
  if (!value || typeof value !== "object") return false
  const day = value as Record<string, unknown>
  return (
    typeof day.dayOfWeek === "number" &&
    typeof day.isClosed === "boolean" &&
    Array.isArray(day.intervals) &&
    day.intervals.every(isInterval)
  )
}

/** Detects a weekly hours snapshot stored in audit `changes`. */
export function isClinicWeeklyHours(
  value: unknown,
): value is ClinicDayHoursLike[] {
  return Array.isArray(value) && value.length > 0 && value.every(isDayHours)
}

export function dayOfWeekLabel(dayOfWeek: number): string {
  return DAY_OF_WEEK_SHORT_PT[dayOfWeek] ?? `Dia ${dayOfWeek}`
}

/** Human-readable schedule for one day, e.g. `Segunda: 08:00–12:00, 14:00–18:00`. */
export function formatClinicDaySchedule(day: ClinicDayHoursLike): string {
  if (day.isClosed || day.intervals.length === 0) {
    return "Fechado"
  }

  return day.intervals
    .map((interval) => `${interval.opensAt}–${interval.closesAt}`)
    .join(", ")
}

function toDayMap(week: ClinicDayHoursLike[]): Map<number, ClinicDayHoursLike> {
  return new Map(week.map((day) => [day.dayOfWeek, day]))
}

/**
 * Diffs two weekly-hours snapshots by weekday.
 * Only days whose schedule changed are returned, in Mon→Sun order.
 */
export function diffClinicWeeklyHours(
  before: ClinicDayHoursLike[],
  after: ClinicDayHoursLike[],
): ClinicHoursDayDiff[] {
  const beforeByDay = toDayMap(before)
  const afterByDay = toDayMap(after)

  const diffs: ClinicHoursDayDiff[] = []

  for (const dayOfWeek of DAY_OF_WEEK_DISPLAY_ORDER) {
    const beforeDay = beforeByDay.get(dayOfWeek)
    const afterDay = afterByDay.get(dayOfWeek)
    if (!beforeDay && !afterDay) continue

    const beforeLabel = beforeDay
      ? formatClinicDaySchedule(beforeDay)
      : "—"
    const afterLabel = afterDay ? formatClinicDaySchedule(afterDay) : "—"

    if (beforeLabel === afterLabel) continue

    diffs.push({
      dayOfWeek,
      dayLabel: dayOfWeekLabel(dayOfWeek),
      beforeLabel,
      afterLabel,
    })
  }

  return diffs
}

/** Summary line for the collapsed card, e.g. `Alterou: Segunda, Quarta`. */
export function summarizeClinicHoursChanges(
  before: unknown,
  after: unknown,
): string | null {
  if (isClinicWeeklyHours(before) && isClinicWeeklyHours(after)) {
    const diffs = diffClinicWeeklyHours(before, after)
    if (diffs.length === 0) return "Horários sem alteração"
    const days = diffs.map((diff) => diff.dayLabel)
    return `Alterou: ${days.slice(0, 4).join(", ")}${days.length > 4 ? "…" : ""}`
  }

  if (isClinicWeeklyHours(after)) {
    return "Horários da clínica atualizados"
  }

  return null
}
