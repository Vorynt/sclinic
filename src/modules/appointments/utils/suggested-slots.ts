import { addDays, addMinutes, format, isSameDay, startOfDay } from "date-fns"

import type { BusyInterval } from "@/modules/appointments/types/availability"
import type { MinuteInterval } from "@/modules/clinics/utils/clinic-hours-window"

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
  limit?: number
  stepMinutes?: number
  searchWindowDays?: number
  /** Intervals for the cursor's local calendar day (minutes from midnight). */
  getDayIntervals?: (day: Date) => MinuteInterval[]
}

function overlaps(
  startsAt: Date,
  endsAt: Date,
  busy: BusyInterval,
): boolean {
  return startsAt < busy.endsAt && endsAt > busy.startsAt
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

function fitsDayIntervals(
  startsAt: Date,
  endsAt: Date,
  intervals: MinuteInterval[],
): boolean {
  if (!isSameDay(startsAt, endsAt) || intervals.length === 0) {
    return false
  }

  const start = minutesOfDay(startsAt)
  const end = minutesOfDay(endsAt)
  return intervals.some(
    (interval) => start >= interval.startMinutes && end <= interval.endMinutes,
  )
}

function alignToStep(date: Date, stepMinutes: number): Date {
  const aligned = new Date(date)
  const remainder = aligned.getMinutes() % stepMinutes
  if (remainder !== 0) {
    aligned.setMinutes(aligned.getMinutes() + (stepMinutes - remainder))
  }
  aligned.setSeconds(0, 0)
  return aligned
}

/** Next step-aligned instant strictly after `date` (exclusive lower bound). */
function nextStepAfter(date: Date, stepMinutes: number): Date {
  const next = new Date(date)
  next.setSeconds(0, 0)
  if (next.getTime() <= date.getTime()) {
    next.setMinutes(next.getMinutes() + 1)
  }
  return alignToStep(next, stepMinutes)
}

function atDayMinutes(day: Date, minutes: number): Date {
  const next = startOfDay(day)
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return next
}

function advanceToNextOpenWindow(
  cursor: Date,
  intervals: MinuteInterval[],
): Date {
  const currentMinutes = minutesOfDay(cursor)

  for (const interval of intervals) {
    if (currentMinutes < interval.startMinutes) {
      return atDayMinutes(cursor, interval.startMinutes)
    }
    if (
      currentMinutes >= interval.startMinutes &&
      currentMinutes < interval.endMinutes
    ) {
      return cursor
    }
  }

  return atDayMinutes(addDays(cursor, 1), 0)
}

/**
 * Finds the next free `startsAt` values after `after`, skipping busy intervals
 * and staying within clinic day intervals.
 */
export function findNextAvailableStarts(
  params: FindNextAvailableStartsParams,
): Date[] {
  const {
    after,
    durationMs,
    busy,
    limit = SUGGESTED_SLOTS_LIMIT,
    stepMinutes = SUGGESTED_SLOT_STEP_MINUTES,
    searchWindowDays = SUGGESTED_SLOTS_SEARCH_DAYS,
    getDayIntervals = () => DEFAULT_DAY_INTERVALS,
  } = params

  if (durationMs <= 0 || limit <= 0) {
    return []
  }

  const searchEnd = addDays(after, searchWindowDays)
  let cursor = nextStepAfter(after, stepMinutes)
  const suggestions: Date[] = []

  while (cursor < searchEnd && suggestions.length < limit) {
    const intervals = getDayIntervals(cursor)
    const slotEnd = new Date(cursor.getTime() + durationMs)

    if (!fitsDayIntervals(cursor, slotEnd, intervals)) {
      const advanced = advanceToNextOpenWindow(cursor, intervals)
      if (advanced.getTime() === cursor.getTime()) {
        cursor = addMinutes(cursor, stepMinutes)
      } else if (advanced <= cursor) {
        cursor = atDayMinutes(addDays(cursor, 1), 0)
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
  const tomorrow = addDays(today, 1)
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
