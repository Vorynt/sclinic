import { routes } from "@/config/routes"

/** List location carried as `?q=&page=` for round-trip back to patients. */
export type PatientsListLocation = {
  q?: string | null
  page?: number | null
}

function buildPatientsListSearch(location?: PatientsListLocation): string {
  const search = new URLSearchParams()
  const q = location?.q?.trim()
  if (q) {
    search.set("q", q)
  }

  const page = location?.page
  if (page != null && page > 1) {
    search.set("page", String(page))
  }

  return search.toString()
}

/** Builds `/patients?q=&page=` restoring list search and pagination. */
export function buildPatientsListHref(location?: PatientsListLocation): string {
  const qs = buildPatientsListSearch(location)
  return qs ? `${routes.patients}?${qs}` : routes.patients
}

/**
 * Patient detail URL that preserves list `q`/`page` so "Voltar" restores
 * the same listing state.
 */
export function buildPatientDetailHref(
  patientId: string,
  list?: PatientsListLocation,
): string {
  const qs = buildPatientsListSearch(list)
  const base = routes.patientDetail(patientId)
  return qs ? `${base}?${qs}` : base
}

/** Appends list `q`/`page` onto any patient-detail section href. */
export function withPatientsListParams(
  href: string,
  list?: PatientsListLocation,
): string {
  const qs = buildPatientsListSearch(list)
  if (!qs) return href

  const url = new URL(href, "http://local")
  const existing = url.searchParams
  const listParams = new URLSearchParams(qs)
  for (const [key, value] of listParams.entries()) {
    existing.set(key, value)
  }
  const next = existing.toString()
  return next ? `${url.pathname}?${next}` : url.pathname
}

export function patientsListLocationFromSearchParams(params: {
  get: (key: string) => string | null
}): PatientsListLocation {
  const q = params.get("q")
  const pageRaw = params.get("page")
  const page = pageRaw ? Number.parseInt(pageRaw, 10) : null

  return {
    q: q && q.trim().length > 0 ? q.trim() : null,
    page: page != null && Number.isFinite(page) && page > 1 ? page : null,
  }
}
