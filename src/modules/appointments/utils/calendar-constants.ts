/**
 * UI-only calendar constants (grid range, slot durations).
 * Kept separate from `constants/appointments.ts`, which is owned by the
 * appointments API layer (status/type labels, professional colors).
 */

/** Visible hour range for week/day time grids (24h clock, end exclusive). */
export const CALENDAR_HOUR_RANGE = { start: 7, end: 20 } as const

/** Pixel height of one hour row in the week/day time grids. */
export const CALENDAR_HOUR_HEIGHT_PX = 56

/** Duration options (minutes) offered when creating an appointment. */
export const APPOINTMENT_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const

/** Minutes rounding step used when clicking an empty slot on the time grid. */
export const CALENDAR_SLOT_STEP_MINUTES = 30
