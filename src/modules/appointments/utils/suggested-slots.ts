import { addMinutes, format, isSameDay, startOfDay } from "date-fns"

import type { BusyInterval } from "@/modules/appointments/types/availability"
import type { MinuteInterval } from "@/modules/clinics/utils/clinic-hours-window"
import {
  addZonedCalendarDays,
  getZonedDateTimeParts,
  isSameZonedDay,
  zonedWallTimeToUtc,
} from "@/modules/clinics/utils/clinic-hours-window"

/** Default clinic day window until clinic hours are configured. */
export const DEFAULT_AVAILABILITY_HOUR_RANGE = { start: 7, end: 19 } as const

export const DEFAULT_DAY_INTERVALS: MinuteInterval[] = [
  {
    startMinutes: DEFAULT_AVAILABILITY_HOUR_RANGE.start * 60,
    endMinutes: DEFAULT_AVAILABILITY_HOUR_RANGE.end * 60,
  },
]

export const SUGGESTED_SLOTS_LIMIT = 3
export const SUGGESTED_SLOT_STEP_MINUTES = 30
export const SUGGESTED_SLOTS_SEARCH_DAYS = 14

type FindNextAvailableStartsParams = {
  /** Exclusive lower bound — search starts at the next step after this. */
  after: Date
  durationMs: number
  busy: BusyInterval[]
  /** Clinic timezone — wall-clock windows are interpreted in this zone. */
  timeZone: string
  limit?: number
  stepMinutes?: number
  searchWindowDays?: number
  /** Intervals for the cursor's calendar day in `timeZone` (minutes from midnight). */
  getDayIntervals?: (day: Date) => MinuteInterval[]
}

function overlaps(
  startsAt: Date,
  endsAt: Date,
  busy: BusyInterval,
): boolean {
  return startsAt < busy.endsAt && endsAt > busy.startsAt
}

function fitsDayIntervals(
  startsAt: Date,
  endsAt: Date,
  intervals: MinuteInterval[],
  timeZone: string,
): boolean {
  if (!isSameZonedDay(startsAt, endsAt, timeZone) || intervals.length === 0) {
    return false
  }

  const start = getZonedDateTimeParts(startsAt, timeZone).minutes
  const end = getZonedDateTimeParts(endsAt, timeZone).minutes
  return intervals.some(
    (interval) => start >= interval.startMinutes && end <= interval.endMinutes,
  )
}

function atZonedDayMinutes(
  day: Date,
  minutes: number,
  timeZone: string,
): Date {
  const parts = getZonedDateTimeParts(day, timeZone)
  return zonedWallTimeToUtc({
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: Math.floor(minutes / 60),
    minute: minutes % 60,
    timeZone,
  })
}

function alignToStep(date: Date, stepMinutes: number, timeZone: string): Date {
  const parts = getZonedDateTimeParts(date, timeZone)
  const remainder = parts.minute % stepMinutes
  const alignedMinutes =
    remainder === 0
      ? parts.minutes
      : parts.minutes + (stepMinutes - remainder)

  if (alignedMinutes >= 24 * 60) {
    return atZonedDayMinutes(
      addZonedCalendarDays(date, 1, timeZone),
      alignedMinutes - 24 * 60,
      timeZone,
    )
  }

  return atZonedDayMinutes(date, alignedMinutes, timeZone)
}

/** Next step-aligned instant strictly after `date` (exclusive lower bound). */
function nextStepAfter(
  date: Date,
  stepMinutes: number,
  timeZone: string,
): Date {
  const bumped = new Date(date.getTime() + 60_000)
  return alignToStep(bumped, stepMinutes, timeZone)
}

function advanceToNextOpenWindow(
  cursor: Date,
  intervals: MinuteInterval[],
  timeZone: string,
): Date {
  const currentMinutes = getZonedDateTimeParts(cursor, timeZone).minutes

  for (const interval of intervals) {
    if (currentMinutes < interval.startMinutes) {
      return atZonedDayMinutes(cursor, interval.startMinutes, timeZone)
    }
    if (
      currentMinutes >= interval.startMinutes &&
      currentMinutes < interval.endMinutes
    ) {
      return cursor
    }
  }

  return addZonedCalendarDays(cursor, 1, timeZone)
}

/**
 * Finds the next free `startsAt` values after `after`, skipping busy intervals
 * and staying within clinic day intervals in the clinic timezone.
 */
export function findNextAvailableStarts(
  params: FindNextAvailableStartsParams,
): Date[] {
  const {
    after,
    durationMs,
    busy,
    timeZone,
    limit = SUGGESTED_SLOTS_LIMIT,
    stepMinutes = SUGGESTED_SLOT_STEP_MINUTES,
    searchWindowDays = SUGGESTED_SLOTS_SEARCH_DAYS,
    getDayIntervals = () => DEFAULT_DAY_INTERVALS,
  } = params

  if (durationMs <= 0 || limit <= 0) {
    return []
  }

  const searchEnd = addZonedCalendarDays(after, searchWindowDays, timeZone)
  let cursor = nextStepAfter(after, stepMinutes, timeZone)
  const suggestions: Date[] = []

  while (cursor < searchEnd && suggestions.length < limit) {
    const intervals = getDayIntervals(cursor)
    const slotEnd = new Date(cursor.getTime() + durationMs)

    if (!fitsDayIntervals(cursor, slotEnd, intervals, timeZone)) {
      const advanced = advanceToNextOpenWindow(cursor, intervals, timeZone)
      if (advanced.getTime() === cursor.getTime()) {
        cursor = addMinutes(cursor, stepMinutes)
      } else if (advanced <= cursor) {
        cursor = addZonedCalendarDays(cursor, 1, timeZone)
      } else {
        cursor = advanced
      }
      continue
    }

    const conflict = busy.some((interval) =>
      overlaps(cursor, slotEnd, interval),
    )
    if (!conflict) {
      suggestions.push(new Date(cursor))
    }

    cursor = addMinutes(cursor, stepMinutes)
  }

  return suggestions
}

/**
 * Chip label for a suggested slot relative to `now`.
 * - Today → "Hoje às HH:mm"
 * - Tomorrow → "Amanhã às HH:mm"
 * - Later → "seg. 27/07/2026"
 *
 * Uses the browser/local calendar so labels match the appointment form fields.
 */
const WEEKDAY_SHORT = [
  "dom.",
  "seg.",
  "ter.",
  "qua.",
  "qui.",
  "sex.",
  "sáb.",
] as const

export function formatSuggestedSlotLabel(
  slot: Date,
  now: Date = new Date(),
): string {
  const today = startOfDay(now)
  const tomorrow = addDaysLocal(today, 1)
  const slotDay = startOfDay(slot)
  const time = format(slot, "HH:mm")

  if (isSameDay(slotDay, today)) {
    return `Hoje às ${time}`
  }

  if (isSameDay(slotDay, tomorrow)) {
    return `Amanhã às ${time}`
  }

  const weekday = WEEKDAY_SHORT[slot.getDay()] ?? ""
  return `${weekday} ${format(slot, "dd/MM/yyyy")}`
}

function addDaysLocal(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** Reads ISO slot suggestions from an AppError / API error meta payload. */
export function readSuggestedSlotsFromMeta(
  meta: Record<string, unknown> | undefined,
): string[] {
  const raw = meta?.suggestedSlots
  if (!Array.isArray(raw)) {
    return []
  }

  return raw.filter(
    (value): value is string =>
      typeof value === "string" && !Number.isNaN(Date.parse(value)),
  )
}
