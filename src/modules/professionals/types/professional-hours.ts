/**
 * Weekly working hours for a professional (ADR-011).
 * Same shape as clinic hours — effective window = clinic ∩ professional.
 */

export type ProfessionalTimeInterval = {
  opensAt: string
  closesAt: string
}

/** `dayOfWeek`: 0 = Sunday … 6 = Saturday (JS `Date#getDay()`). */
export type ProfessionalDayHours = {
  dayOfWeek: number
  isClosed: boolean
  intervals: ProfessionalTimeInterval[]
}

/** Full week — always 7 entries, sorted by `dayOfWeek` 0…6. */
export type ProfessionalWeeklyHours = ProfessionalDayHours[]
