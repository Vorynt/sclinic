import {
  BILLING_KIND_LABELS,
  CHARGE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/billing/constants/charges"
import {
  BILLING_KINDS,
  CHARGE_STATUSES,
  PAYMENT_METHODS,
} from "@/modules/billing/schemas/charge.schema"
import {
  currentYearIsoRange,
  lastDaysIsoRange,
  previousMonthIsoRange,
} from "@/modules/billing/utils/charge-period"
import { formatISODate } from "@/utils/date"

export const CHARGE_STATUS_FILTERS = ["all", ...CHARGE_STATUSES] as const
export const CHARGE_KIND_FILTERS = ["all", ...BILLING_KINDS] as const
export const CHARGE_METHOD_FILTERS = ["all", ...PAYMENT_METHODS] as const

export type ChargeStatusFilter = (typeof CHARGE_STATUS_FILTERS)[number]
export type ChargeKindFilter = (typeof CHARGE_KIND_FILTERS)[number]
export type ChargeMethodFilter = (typeof CHARGE_METHOD_FILTERS)[number]

export type ChargePeriodPreset =
  | "this-month"
  | "last-month"
  | "last-30"
  | "this-year"
  | "all"
  | "custom"

export type ChargeSheetFilters = {
  from: string | null
  to: string | null
  periodAll: boolean
  status: ChargeStatusFilter
  billingKind: ChargeKindFilter
  method: ChargeMethodFilter
  serviceId: string | null
  overdue: boolean
  patientId: string | null
}

export const DEFAULT_CHARGE_SHEET_FILTERS: ChargeSheetFilters = {
  from: null,
  to: null,
  periodAll: false,
  status: "all",
  billingKind: "all",
  method: "all",
  serviceId: null,
  overdue: false,
  patientId: null,
}

export function resolveChargePeriodPreset(params: {
  from: string | null
  to: string | null
  periodAll: boolean
  timeZone: string
  now?: Date
}): ChargePeriodPreset {
  if (params.periodAll) return "all"
  if (!params.from && !params.to) return "this-month"

  const now = params.now ?? new Date()
  const lastMonth = previousMonthIsoRange(now, params.timeZone)
  if (params.from === lastMonth.from && params.to === lastMonth.to) {
    return "last-month"
  }
  const last30 = lastDaysIsoRange(now, params.timeZone, 30)
  if (params.from === last30.from && params.to === last30.to) {
    return "last-30"
  }
  const year = currentYearIsoRange(now, params.timeZone)
  if (params.from === year.from && params.to === year.to) {
    return "this-year"
  }
  return "custom"
}

export function countChargeSheetFilters(
  filters: ChargeSheetFilters,
  options: { timeZone: string; now?: Date },
): number {
  let count = 0
  const preset = resolveChargePeriodPreset({
    from: filters.from,
    to: filters.to,
    periodAll: filters.periodAll,
    timeZone: options.timeZone,
    now: options.now,
  })
  if (preset === "custom") count += 1
  if (filters.status !== "all") count += 1
  if (filters.billingKind !== "all") count += 1
  if (filters.method !== "all") count += 1
  if (filters.serviceId) count += 1
  if (filters.overdue) count += 1
  if (filters.patientId) count += 1
  return count
}

export type ChargeSheetFilterChip = {
  id: string
  label: string
  key:
    | "period"
    | "status"
    | "billingKind"
    | "method"
    | "serviceId"
    | "overdue"
    | "patientId"
}

export function listChargeSheetFilterChips(
  filters: ChargeSheetFilters,
  options: { timeZone: string; now?: Date; serviceName?: string | null },
): ChargeSheetFilterChip[] {
  const chips: ChargeSheetFilterChip[] = []
  const preset = resolveChargePeriodPreset({
    from: filters.from,
    to: filters.to,
    periodAll: filters.periodAll,
    timeZone: options.timeZone,
    now: options.now,
  })

  if (preset === "custom" && filters.from && filters.to) {
    chips.push({
      id: "period",
      key: "period",
      label: `${formatISODate(filters.from)}–${formatISODate(filters.to)}`,
    })
  }
  if (filters.status !== "all") {
    chips.push({
      id: "status",
      key: "status",
      label: CHARGE_STATUS_LABELS[filters.status] ?? filters.status,
    })
  }
  if (filters.billingKind !== "all") {
    chips.push({
      id: "billingKind",
      key: "billingKind",
      label: BILLING_KIND_LABELS[filters.billingKind] ?? filters.billingKind,
    })
  }
  if (filters.method !== "all") {
    chips.push({
      id: "method",
      key: "method",
      label: PAYMENT_METHOD_LABELS[filters.method] ?? filters.method,
    })
  }
  if (filters.serviceId) {
    chips.push({
      id: "serviceId",
      key: "serviceId",
      label: options.serviceName?.trim() || "Serviço",
    })
  }
  if (filters.overdue) {
    chips.push({
      id: "overdue",
      key: "overdue",
      label: "Somente vencidas",
    })
  }
  if (filters.patientId) {
    chips.push({
      id: "patientId",
      key: "patientId",
      label: "Paciente filtrado",
    })
  }

  return chips
}

export function areChargeSheetFiltersEqual(
  a: ChargeSheetFilters,
  b: ChargeSheetFilters,
): boolean {
  return (
    a.from === b.from &&
    a.to === b.to &&
    a.periodAll === b.periodAll &&
    a.status === b.status &&
    a.billingKind === b.billingKind &&
    a.method === b.method &&
    a.serviceId === b.serviceId &&
    a.overdue === b.overdue &&
    a.patientId === b.patientId
  )
}
