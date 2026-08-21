import type {
  BillingInsightGrain,
  BillingInsights,
} from "@/modules/billing/types/charge"

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})/

export type InsightTimeRow = BillingInsights["byTime"][number]

function pad2(value: number): string {
  return String(value).padStart(2, "0")
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

/** Calendar YYYY-MM-DD from a Postgres date / date_trunc bucket. */
export function normalizeInsightBucket(bucket: string): string {
  const match = ISO_DATE_RE.exec(bucket.trim())
  if (!match) return bucket.trim()
  return `${match[1]}-${match[2]}-${match[3]}`
}

function utcFromIso(isoDate: string): Date | null {
  const match = ISO_DATE_RE.exec(isoDate)
  if (!match) return null
  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  )
}

function isoFromUtc(date: Date): string {
  return toIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

function addUtcDays(isoDate: string, days: number): string {
  const utc = utcFromIso(isoDate)
  if (!utc) return isoDate
  utc.setUTCDate(utc.getUTCDate() + days)
  return isoFromUtc(utc)
}

/** Monday of the ISO week, matching Postgres `date_trunc('week', ...)`. */
export function isoWeekMonday(isoDate: string): string {
  const utc = utcFromIso(isoDate)
  if (!utc) return isoDate
  const day = utc.getUTCDay()
  const offset = day === 0 ? -6 : 1 - day
  utc.setUTCDate(utc.getUTCDate() + offset)
  return isoFromUtc(utc)
}

function eachBucket(from: string, to: string, grain: BillingInsightGrain): string[] {
  if (from > to) return []

  if (grain === "day") {
    const buckets: string[] = []
    let cursor = from
    while (cursor <= to) {
      buckets.push(cursor)
      cursor = addUtcDays(cursor, 1)
    }
    return buckets
  }

  const buckets: string[] = []
  let cursor = isoWeekMonday(from)
  const end = isoWeekMonday(to)
  while (cursor <= end) {
    buckets.push(cursor)
    cursor = addUtcDays(cursor, 7)
  }
  return buckets
}

function emptyRow(bucket: string): InsightTimeRow {
  return {
    bucket,
    billedCents: 0,
    receivedCents: 0,
    count: 0,
  }
}

/**
 * Ensures every day (or ISO week) in the resolved period appears on the series,
 * even when there were no charges that day.
 */
export function fillChargeInsightTimeBuckets(params: {
  rows: InsightTimeRow[]
  from: string | null
  to: string | null
  grain: BillingInsightGrain
}): InsightTimeRow[] {
  const byBucket = new Map(
    params.rows.map((row) => {
      const bucket = normalizeInsightBucket(row.bucket)
      return [bucket, { ...row, bucket }] as const
    }),
  )

  let from = params.from
  let to = params.to
  if (!from || !to) {
    if (byBucket.size === 0) return []
    const keys = [...byBucket.keys()].sort()
    from = keys[0] ?? null
    to = keys[keys.length - 1] ?? null
  }
  if (!from || !to) return []

  return eachBucket(from, to, params.grain).map(
    (bucket) => byBucket.get(bucket) ?? emptyRow(bucket),
  )
}
