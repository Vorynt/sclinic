import { routes } from "@/config/routes"
import { parseISODate } from "@/utils/date"

/** Prefill + lock flags for `/appointments/new`. */
export type AppointmentNewHrefParams = {
  patientId?: string | null
  patientName?: string | null
  /** When true, patient combobox is locked on the full page. */
  lockPatient?: boolean
  professionalId?: string | null
  professionalName?: string | null
  /**
   * Local calendar date `YYYY-MM-DD` (preferred over `startsAt` to avoid TZ shift).
   */
  date?: string | null
  /** Local wall time `HH:mm`. */
  startTime?: string | null
  /** ISO datetime or Date — fallback when `date`/`startTime` are absent. */
  startsAt?: Date | string | null
  type?: string | null
  modality?: string | null
  durationMinutes?: string | number | null
  serviceId?: string | null
  waitlistId?: string | null
  reason?: string | null
}

const START_TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function setIfPresent(
  search: URLSearchParams,
  key: string,
  value: string | number | boolean | null | undefined,
) {
  if (value == null) return
  const normalized = typeof value === "string" ? value.trim() : String(value)
  if (normalized === "" || normalized === "false") return
  search.set(key, normalized)
}

/** Builds `/appointments/new?...` with only defined params. */
export function buildAppointmentNewHref(
  params: AppointmentNewHrefParams = {},
): string {
  const search = new URLSearchParams()

  setIfPresent(search, "patientId", params.patientId)
  setIfPresent(search, "patientName", params.patientName)
  if (params.lockPatient) {
    search.set("lockPatient", "1")
  }
  setIfPresent(search, "professionalId", params.professionalId)
  setIfPresent(search, "professionalName", params.professionalName)
  setIfPresent(search, "date", params.date)
  setIfPresent(search, "startTime", params.startTime)
  // Prefer wall-clock params; only emit startsAt when date/time are missing.
  if (!params.date?.trim() || !params.startTime?.trim()) {
    if (params.startsAt) {
      const iso =
        typeof params.startsAt === "string"
          ? params.startsAt
          : params.startsAt.toISOString()
      setIfPresent(search, "startsAt", iso)
    }
  }
  setIfPresent(search, "type", params.type)
  setIfPresent(search, "modality", params.modality)
  setIfPresent(search, "durationMinutes", params.durationMinutes)
  setIfPresent(search, "serviceId", params.serviceId)
  setIfPresent(search, "waitlistId", params.waitlistId)
  setIfPresent(search, "reason", params.reason)

  const qs = search.toString()
  return qs ? `${routes.appointmentNew}?${qs}` : routes.appointmentNew
}

export type AppointmentNewLocation = {
  patientId: string | null
  patientName: string | null
  lockPatient: boolean
  professionalId: string | null
  professionalName: string | null
  /** Local `YYYY-MM-DD` when provided. */
  date: string | null
  /** Local `HH:mm` when provided. */
  startTime: string | null
  startsAt: Date | undefined
  type: string | null
  modality: string | null
  durationMinutes: string | null
  serviceId: string | null
  waitlistId: string | null
  reason: string | null
}

function combineLocalDateAndTime(
  date: string,
  startTime: string,
): Date | undefined {
  const day = parseISODate(date)
  if (!day || !START_TIME_RE.test(startTime.trim())) return undefined
  const [hours, minutes] = startTime.trim().split(":").map(Number)
  const combined = new Date(day)
  combined.setHours(hours, minutes, 0, 0)
  return combined
}

/** Reads `/appointments/new` search params into form defaults. */
export function appointmentNewLocationFromSearchParams(params: {
  get: (key: string) => string | null
}): AppointmentNewLocation {
  const date = params.get("date")
  const startTime = params.get("startTime")
  const startsAtRaw = params.get("startsAt")

  let startsAt: Date | undefined
  if (date && startTime) {
    startsAt = combineLocalDateAndTime(date, startTime)
  } else if (startsAtRaw) {
    const parsed = new Date(startsAtRaw)
    if (!Number.isNaN(parsed.getTime())) {
      startsAt = parsed
    }
  }

  const lockRaw = params.get("lockPatient")
  const waitlistId = params.get("waitlistId")

  return {
    patientId: params.get("patientId"),
    patientName: params.get("patientName"),
    lockPatient: lockRaw === "1" || lockRaw === "true" || Boolean(waitlistId),
    professionalId: params.get("professionalId"),
    professionalName: params.get("professionalName"),
    date,
    startTime:
      startTime && START_TIME_RE.test(startTime.trim())
        ? startTime.trim()
        : null,
    startsAt,
    type: params.get("type"),
    modality: params.get("modality"),
    durationMinutes: params.get("durationMinutes"),
    serviceId: params.get("serviceId"),
    waitlistId,
    reason: params.get("reason"),
  }
}
