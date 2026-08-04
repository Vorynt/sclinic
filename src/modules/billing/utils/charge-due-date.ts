import { addZonedCalendarDays } from "@/modules/clinics/utils/clinic-hours-window"

/**
 * End of the clinic-local calendar day (23:59:59.999) for `date`, in `timeZone`.
 * Used as the charge due date for consultations booked same-day (ADR-011).
 */
export function endOfClinicLocalDay(date: Date, timeZone: string): Date {
  const startOfNextDay = addZonedCalendarDays(date, 1, timeZone)
  return new Date(startOfNextDay.getTime() - 1)
}
