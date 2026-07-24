import { differenceInYears, parseISO } from "date-fns"

/** Age in full years from an ISO date string (`YYYY-MM-DD`), or null. */
export function getPatientAgeYears(
  birthDate: string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!birthDate) return null
  const parsed = parseISO(birthDate)
  if (Number.isNaN(parsed.getTime())) return null
  return differenceInYears(now, parsed)
}
