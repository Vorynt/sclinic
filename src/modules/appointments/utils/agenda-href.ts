import { routes } from "@/config/routes"
import {
  isAttendancePanel,
  type AttendancePanel,
} from "@/modules/appointments/constants/attendance-panels"
import type { CalendarViewMode } from "@/modules/appointments/utils/calendar-range"
import { toISODate } from "@/utils/date"

/** Agenda location carried as `?mode=&date=` (same contract as the calendar page). */
export type AgendaLocation = {
  mode?: CalendarViewMode | null
  date?: Date | string | null
}

/** Attendance URL extras on top of the agenda round-trip params. */
export type AttendanceHrefLocation = AgendaLocation & {
  panel?: AttendancePanel | null
}

export type SearchParamsLike = {
  get: (key: string) => string | null
}

export type NextSearchParams = Record<string, string | string[] | undefined>

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
  location?: AttendanceHrefLocation,
): string {
  const search = new URLSearchParams()

  if (location?.mode && isCalendarViewMode(location.mode)) {
    search.set("mode", location.mode)
  }

  if (location?.date) {
    search.set("date", toDateParam(location.date))
  }

  if (location?.panel && isAttendancePanel(location.panel)) {
    search.set("panel", location.panel)
  }

  const qs = search.toString()
  const base = routes.appointmentAttendance(appointmentId)
  return qs ? `${base}?${qs}` : base
}

export function agendaLocationFromSearchParams(
  params: SearchParamsLike,
): AgendaLocation {
  const mode = params.get("mode")
  const date = params.get("date")

  return {
    mode: isCalendarViewMode(mode) ? mode : null,
    date,
  }
}

export function attendancePanelFromSearchParams(
  params: SearchParamsLike,
): AttendancePanel | null {
  const panel = params.get("panel")
  return isAttendancePanel(panel) ? panel : null
}

export function firstSearchParam(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export function searchParamsAdapter(
  searchParams: NextSearchParams,
): SearchParamsLike {
  return {
    get(key: string) {
      return firstSearchParam(searchParams[key])
    },
  }
}

/** Landing href that keeps agenda `mode`/`date` and optionally opens a sheet. */
export function buildAttendanceRedirectHref(
  appointmentId: string,
  searchParams: NextSearchParams,
  panel?: AttendancePanel | null,
): string {
  return buildAttendanceHref(appointmentId, {
    ...agendaLocationFromSearchParams(searchParamsAdapter(searchParams)),
    panel: panel ?? null,
  })
}
