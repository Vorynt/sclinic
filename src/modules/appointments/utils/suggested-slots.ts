import { addDays, addMinutes, format, isSameDay, startOfDay } from "date-fns"

import type { BusyInterval } from "@/modules/appointments/types/availability"

/** Default clinic day window until professionals define their own schedules. */
export const DEFAULT_AVAILABILITY_HOUR_RANGE = { start: 7, end: 20 } as const

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
  dayHourRange?: { start: number; end: number }
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

function fitsDayHours(
  startsAt: Date,
  endsAt: Date,
  range: { start: number; end: number },
): boolean {
  if (!isSameDay(startsAt, endsAt)) {
    return false
  }

  const startBound = range.start * 60
  const endBound = range.end * 60
  return (
    minutesOfDay(startsAt) >= startBound && minutesOfDay(endsAt) <= endBound
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

function atDayHour(day: Date, hour: number): Date {
  const next = startOfDay(day)
  next.setHours(hour, 0, 0, 0)
  return next
}

/**
 * Finds the next free `startsAt` values after `after`, skipping busy intervals
 * and staying within the default day hour range (until professional schedules exist).
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
    dayHourRange = DEFAULT_AVAILABILITY_HOUR_RANGE,
  } = params

  if (durationMs <= 0 || limit <= 0) {
    return []
  }

  const searchEnd = addDays(after, searchWindowDays)
  let cursor = alignToStep(addMinutes(after, stepMinutes), stepMinutes)
  const suggestions: Date[] = []

  while (cursor < searchEnd && suggestions.length < limit) {
    const slotEnd = new Date(cursor.getTime() + durationMs)

    if (!fitsDayHours(cursor, slotEnd, dayHourRange)) {
      const dayStart = atDayHour(cursor, dayHourRange.start)
      if (cursor <= dayStart) {
        cursor = dayStart
      } else {
        cursor = atDayHour(addDays(cursor, 1), dayHourRange.start)
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

