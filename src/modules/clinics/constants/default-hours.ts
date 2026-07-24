import {
  DEFAULT_CLINIC_DAY_INTERVAL,
  type ClinicWeeklyHours,
} from "@/modules/clinics/types/clinic-hours"

/** Default week used by onboarding “Configurar depois” (7h–19h every day). */
export function buildDefaultWeeklyHours(): ClinicWeeklyHours {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: false,
    intervals: [{ ...DEFAULT_CLINIC_DAY_INTERVAL }],
  }))
}

/**
 * Draft shown in onboarding / empty settings — demonstrates 2 intervals
 * (morning + afternoon) on weekdays.
 */
export function buildOnboardingHoursDraft(): ClinicWeeklyHours {
  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    if (dayOfWeek === 0) {
      return { dayOfWeek, isClosed: true, intervals: [] }
    }

    if (dayOfWeek === 6) {
      return {
        dayOfWeek,
        isClosed: false,
        intervals: [{ opensAt: "08:00", closesAt: "12:00" }],
      }
    }

    return {
      dayOfWeek,
      isClosed: false,
      intervals: [
        { opensAt: "08:00", closesAt: "12:00" },
        { opensAt: "14:00", closesAt: "18:00" },
      ],
    }
  })
}
