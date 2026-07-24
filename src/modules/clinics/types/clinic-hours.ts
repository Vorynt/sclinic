/** `HH:mm` wall-clock time in the clinic timezone. */
export type ClinicTimeInterval = {
  opensAt: string
  closesAt: string
}

/**
 * One weekday of clinic operation.
 * `dayOfWeek`: 0 = Sunday … 6 = Saturday (JS `Date#getDay()`).
 * `intervals`: 0–2 ranges when open (morning / afternoon).
 */
export type ClinicDayHours = {
  dayOfWeek: number
  isClosed: boolean
  intervals: ClinicTimeInterval[]
}

/** Full week — always 7 entries, sorted by `dayOfWeek` 0…6. */
export type ClinicWeeklyHours = ClinicDayHours[]

/** Default single-interval window applied by “Configurar depois”. */
export const DEFAULT_CLINIC_DAY_INTERVAL: ClinicTimeInterval = {
  opensAt: "07:00",
  closesAt: "19:00",
}

export const DAY_OF_WEEK_LABELS_PT: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
}

/** Compact labels for dense weekly schedules. */
export const DAY_OF_WEEK_SHORT_PT: Record<number, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
}

/** Display order in BR UIs (Mon → Sun). */
export const DAY_OF_WEEK_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export const WEEKDAY_DAY_OF_WEEK = [1, 2, 3, 4, 5] as const
