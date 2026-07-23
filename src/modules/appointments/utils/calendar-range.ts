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

export type CalendarRange = {
  from: Date
  to: Date
}

/** Visible range for a view mode; month/week ranges cover full weeks (locale pt-BR). */
export function getVisibleRange(
  mode: CalendarViewMode,
  anchor: Date,
): CalendarRange {
  if (mode === "month") {
    return {
      from: startOfWeek(startOfMonth(anchor), { locale: ptBR }),
      to: endOfWeek(endOfMonth(anchor), { locale: ptBR }),
    }
  }

  if (mode === "week") {
    return {
      from: startOfWeek(anchor, { locale: ptBR }),
      to: endOfWeek(anchor, { locale: ptBR }),
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
export function getPeriodLabel(mode: CalendarViewMode, anchor: Date): string {
  if (mode === "month") {
    return format(anchor, "MMMM 'de' yyyy", { locale: ptBR })
  }

  if (mode === "week") {
    const { from, to } = getVisibleRange("week", anchor)
    const sameMonth = from.getMonth() === to.getMonth()
    const fromLabel = format(from, sameMonth ? "dd" : "dd MMM", {
      locale: ptBR,
    })
    const toLabel = format(to, "dd MMM yyyy", { locale: ptBR })
    return `${fromLabel} – ${toLabel}`
  }

  return format(anchor, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}
