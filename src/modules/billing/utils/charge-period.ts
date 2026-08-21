import {
  addZonedCalendarDays,
  getZonedDateTimeParts,
  zonedWallTimeToUtc,
} from "@/modules/clinics/utils/clinic-hours-window"
import { endOfClinicLocalDay } from "@/modules/billing/utils/charge-due-date"
import type { BillingInsightGrain } from "@/modules/billing/types/charge"

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const DAY_MS = 24 * 60 * 60 * 1000
const DAY_GRAIN_MAX_DAYS = 45

export type ChargePeriodInput = {
  from?: string
  to?: string
  periodAll?: boolean
  timeZone: string
  now?: Date
}

export type ResolvedChargePeriod = {
  startsAtFrom?: Date
  startsAtTo?: Date
  from: string | null
  to: string | null
  periodAll: boolean
  grain: BillingInsightGrain
}

function pad2(value: number): string {
  return String(value).padStart(2, "0")
}

export function toZonedIsoDate(date: Date, timeZone: string): string {
  const parts = getZonedDateTimeParts(date, timeZone)
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`
}

function parseIsoParts(
  value: string,
): { year: number; month: number; day: number } | null {
  const match = ISO_DATE_RE.exec(value)
  if (!match) return null
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
}

export function clinicDayStart(isoDate: string, timeZone: string): Date {
  const parts = parseIsoParts(isoDate)
  if (!parts) {
    throw new Error(`Invalid ISO date: ${isoDate}`)
  }
  return zonedWallTimeToUtc({
    ...parts,
    hour: 0,
    minute: 0,
    timeZone,
  })
}

export function clinicDayEnd(isoDate: string, timeZone: string): Date {
  return endOfClinicLocalDay(clinicDayStart(isoDate, timeZone), timeZone)
}

function lastDayOfMonthIso(year: number, month: number): string {
  const last = new Date(Date.UTC(year, month, 0))
  return `${last.getUTCFullYear()}-${pad2(last.getUTCMonth() + 1)}-${pad2(last.getUTCDate())}`
}

export function currentMonthIsoRange(
  now: Date,
  timeZone: string,
): { from: string; to: string } {
  const parts = getZonedDateTimeParts(now, timeZone)
  return {
    from: `${parts.year}-${pad2(parts.month)}-01`,
    to: lastDayOfMonthIso(parts.year, parts.month),
  }
}

export function previousMonthIsoRange(
  now: Date,
  timeZone: string,
): { from: string; to: string } {
  const parts = getZonedDateTimeParts(now, timeZone)
  const year = parts.month === 1 ? parts.year - 1 : parts.year
  const month = parts.month === 1 ? 12 : parts.month - 1
  return {
    from: `${year}-${pad2(month)}-01`,
    to: lastDayOfMonthIso(year, month),
  }
}

export function lastDaysIsoRange(
  now: Date,
  timeZone: string,
  days: number,
): { from: string; to: string } {
  const to = toZonedIsoDate(now, timeZone)
  const fromDate = addZonedCalendarDays(now, -(days - 1), timeZone)
  return { from: toZonedIsoDate(fromDate, timeZone), to }
}

export function currentYearIsoRange(
  now: Date,
  timeZone: string,
): { from: string; to: string } {
  const parts = getZonedDateTimeParts(now, timeZone)
  return {
    from: `${parts.year}-01-01`,
    to: toZonedIsoDate(now, timeZone),
  }
}

function grainForRange(from: Date, to: Date): BillingInsightGrain {
  const spanDays = (to.getTime() - from.getTime()) / DAY_MS
  return spanDays <= DAY_GRAIN_MAX_DAYS ? "day" : "week"
}

/**
 * Resolves list/insights period against clinic timezone.
 * Missing from/to (and not periodAll) defaults to the current clinic-local month.
 */
export function resolveChargePeriod(
  input: ChargePeriodInput,
): ResolvedChargePeriod {
  const now = input.now ?? new Date()

  if (input.periodAll) {
    return {
      from: null,
      to: null,
      periodAll: true,
      grain: "week",
    }
  }

  const range =
    input.from && input.to
      ? { from: input.from, to: input.to }
      : input.from
        ? { from: input.from, to: input.from }
        : input.to
          ? { from: input.to, to: input.to }
          : currentMonthIsoRange(now, input.timeZone)

  const startsAtFrom = clinicDayStart(range.from, input.timeZone)
  const startsAtTo = clinicDayEnd(range.to, input.timeZone)

  return {
    startsAtFrom,
    startsAtTo,
    from: range.from,
    to: range.to,
    periodAll: false,
    grain: grainForRange(startsAtFrom, startsAtTo),
  }
}
