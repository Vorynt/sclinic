import type { ClinicTimeInterval } from "@/modules/clinics/types/clinic-hours"

/** Compact readable summary for a day (week strip / screen readers). */
export function formatDayHoursSummary(day: {
  isClosed: boolean
  intervals: ClinicTimeInterval[]
}): string {
  if (day.isClosed || day.intervals.length === 0) {
    return "Fechado"
  }

  return day.intervals
    .map((interval) => `${interval.opensAt}–${interval.closesAt}`)
    .join(", ")
}
