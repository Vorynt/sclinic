import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"

export type CalendarViewMode = "month" | "week" | "day"

export type CalendarWeekStartsOn = 0 | 1

export type CalendarRange = {
  from: Date
  to: Date
}

export type CalendarRangeOptions = {
  weekStartsOn?: CalendarWeekStartsOn
}

/** Monday, matching pt-BR locale default. */
export const DEFAULT_WEEK_STARTS_ON: CalendarWeekStartsOn = 1

function weekOptions(weekStartsOn: CalendarWeekStartsOn = DEFAULT_WEEK_STARTS_ON) {
  return { locale: ptBR, weekStartsOn }
}

/** Visible range for a view mode; month/week ranges cover full weeks. */
export function getVisibleRange(
  mode: CalendarViewMode,
  anchor: Date,
  options?: CalendarRangeOptions,
): CalendarRange {
  const weekOpts = weekOptions(options?.weekStartsOn)

  if (mode === "month") {
    return {
      from: startOfWeek(startOfMonth(anchor), weekOpts),
      to: endOfWeek(endOfMonth(anchor), weekOpts),
    }
  }

  if (mode === "week") {
    return {
      from: startOfWeek(anchor, weekOpts),
      to: endOfWeek(anchor, weekOpts),
    }
  }

  return { from: startOfDay(anchor), to: endOfDay(anchor) }
}

export function getNextAnchor(mode: CalendarViewMode, anchor: Date): Date {
  if (mode === "month") return addMonths(anchor, 1)
  if (mode === "week") return addWeeks(anchor, 1)
  return addDays(anchor, 1)
}

export function getPreviousAnchor(mode: CalendarViewMode, anchor: Date): Date {
  if (mode === "month") return addMonths(anchor, -1)
  if (mode === "week") return addWeeks(anchor, -1)
  return addDays(anchor, -1)
}

/** Human label for the current period, e.g. "Julho de 2026". */
export function getPeriodLabel(
  mode: CalendarViewMode,
  anchor: Date,
  options?: CalendarRangeOptions,
): string {
  if (mode === "month") {
    return format(anchor, "MMMM 'de' yyyy", { locale: ptBR })
  }

  if (mode === "week") {
    const { from, to } = getVisibleRange("week", anchor, options)
    const sameMonth = from.getMonth() === to.getMonth()
    const fromLabel = format(from, sameMonth ? "dd" : "dd MMM", {
      locale: ptBR,
    })
    const toLabel = format(to, "dd MMM yyyy", { locale: ptBR })
    return `${fromLabel} – ${toLabel}`
  }

  return format(anchor, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}
