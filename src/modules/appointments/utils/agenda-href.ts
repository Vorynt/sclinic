import { routes } from "@/config/routes"
import type { CalendarViewMode } from "@/modules/appointments/utils/calendar-range"
import { toISODate } from "@/utils/date"

/** Agenda location carried as `?mode=&date=` (same contract as the calendar page). */
export type AgendaLocation = {
  mode?: CalendarViewMode | null
  date?: Date | string | null
}

export function isCalendarViewMode(
  value: string | null | undefined,
): value is CalendarViewMode {
  return value === "month" || value === "week" || value === "day"
}

function toDateParam(date: Date | string): string {
  return typeof date === "string" ? date : toISODate(date)
}

/** Builds `/appointments?mode=&date=` for round-trip back to the calendar. */
export function buildAgendaHref(location?: AgendaLocation): string {
  const search = new URLSearchParams()

  if (location?.mode && isCalendarViewMode(location.mode)) {
    search.set("mode", location.mode)
  }

  if (location?.date) {
    search.set("date", toDateParam(location.date))
  }

  const qs = search.toString()
  return qs ? `${routes.appointments}?${qs}` : routes.appointments
}

/**
 * Attendance URL that preserves agenda `mode`/`date` so "Voltar à agenda"
 * restores the same calendar view.
 */
export function buildAttendanceHref(
  appointmentId: string,
  agenda?: AgendaLocation,
): string {
  const search = new URLSearchParams()

  if (agenda?.mode && isCalendarViewMode(agenda.mode)) {
    search.set("mode", agenda.mode)
  }

  if (agenda?.date) {
    search.set("date", toDateParam(agenda.date))
  }

  const qs = search.toString()
  const base = routes.appointmentAttendance(appointmentId)
  return qs ? `${base}?${qs}` : base
}

export function agendaLocationFromSearchParams(params: {
  get: (key: string) => string | null
}): AgendaLocation {
  const mode = params.get("mode")
  const date = params.get("date")

  return {
    mode: isCalendarViewMode(mode) ? mode : null,
    date,
  }
}
