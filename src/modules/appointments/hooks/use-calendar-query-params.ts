"use client"

import { isSameDay, startOfDay } from "date-fns"
import {
  createParser,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs"

import type { CalendarViewMode } from "@/modules/appointments/utils/calendar-range"
import { parseISODate, toISODate } from "@/utils/date"

const CALENDAR_VIEW_MODES = ["month", "week", "day"] as const

/** Local calendar day (`YYYY-MM-DD`), avoiding UTC shift from `parseAsIsoDate`. */
const parseAsLocalDate = createParser({
  parse(value) {
    return parseISODate(value) ?? null
  },
  serialize(value) {
    return toISODate(value)
  },
  eq(a, b) {
    return isSameDay(a, b)
  },
})

/**
 * Persists calendar view mode and anchor date in the URL (`?mode=&date=`).
 * Missing params fall back to month + today (mobile may set day on first visit).
 */
export function useCalendarQueryParams() {
  const [params, setParams] = useQueryStates(
    {
      mode: parseAsStringLiteral(CALENDAR_VIEW_MODES),
      date: parseAsLocalDate,
    },
    {
      history: "replace",
      shallow: true,
    },
  )

  const mode: CalendarViewMode = params.mode ?? "month"
  const date = params.date ?? startOfDay(new Date())
  const hasExplicitMode = params.mode !== null

  function setMode(next: CalendarViewMode) {
    void setParams({ mode: next })
  }

  function setDate(next: Date) {
    void setParams({ date: startOfDay(next) })
  }

  function setModeAndDate(nextMode: CalendarViewMode, nextDate: Date) {
    void setParams({
      mode: nextMode,
      date: startOfDay(nextDate),
    })
  }

  return {
    mode,
    date,
    hasExplicitMode,
    setMode,
    setDate,
    setModeAndDate,
  }
}
