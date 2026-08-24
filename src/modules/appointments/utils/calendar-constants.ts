/**
 * UI-only calendar constants (grid range, slot durations).
 * Kept separate from `constants/appointments.ts`, which is owned by the
 * appointments API layer (status/type labels, professional colors).
 */

/** Fallback visible hour range when clinic hours are missing/closed (24h, end exclusive). */
export const CALENDAR_HOUR_RANGE = { start: 7, end: 20 } as const

/**
 * Pixel height of one hour row in the week/day time grids.
 * A 30-minute block (~half this value) fits status + patient; time and
 * extra fields appear as the slot grows.
 */
export const CALENDAR_HOUR_HEIGHT_PX = 120

/** Duration options (minutes) offered when creating an appointment. */
export const APPOINTMENT_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const

/** Minutes rounding step used when clicking an empty slot on the time grid. */
export const CALENDAR_SLOT_STEP_MINUTES = 30
