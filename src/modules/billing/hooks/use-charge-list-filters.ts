"use client"

import {
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs"

import { useListQueryParams } from "@/hooks/use-list-query-params"
import type {
  BillingInsightsInput,
  ListChargesInput,
} from "@/modules/billing/schemas/charge.schema"
import type { ChargeStatus } from "@/modules/billing/types/charge"
import type { ChargeSheetFilters } from "@/modules/billing/utils/charge-sheet-filters"
import {
  CHARGE_KIND_FILTERS,
  CHARGE_METHOD_FILTERS,
  CHARGE_STATUS_FILTERS,
} from "@/modules/billing/utils/charge-sheet-filters"
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators"

export type StatusFilter = (typeof CHARGE_STATUS_FILTERS)[number]

function omitEmpty<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T
}

export function useChargeListFilters() {
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(CHARGE_STATUS_FILTERS).withDefault("all"),
  )
  const [overdue, setOverdue] = useQueryState(
    "overdue",
    parseAsBoolean.withDefault(false),
  )
  const [from, setFrom] = useQueryState("from", parseAsString)
  const [to, setTo] = useQueryState("to", parseAsString)
  const [periodAll, setPeriodAll] = useQueryState(
    "all",
    parseAsBoolean.withDefault(false),
  )
  const [serviceId, setServiceId] = useQueryState("serviceId", parseAsString)
  const [billingKind, setBillingKind] = useQueryState(
    "kind",
    parseAsStringLiteral(CHARGE_KIND_FILTERS).withDefault("all"),
  )
  const [method, setMethod] = useQueryState(
    "method",
    parseAsStringLiteral(CHARGE_METHOD_FILTERS).withDefault("all"),
  )
  const [patientId, setPatientId] = useQueryState("patientId", parseAsString)

  const chargeFilters: BillingInsightsInput = omitEmpty({
    q: q || undefined,
    status: status === "all" ? undefined : (status as ChargeStatus),
    overdue: overdue || undefined,
    from: from || undefined,
    to: to || undefined,
    periodAll: periodAll || undefined,
    serviceId: serviceId || undefined,
    billingKind: billingKind === "all" ? undefined : billingKind,
    method: method === "all" ? undefined : method,
    patientId: patientId || undefined,
  })

  const listFilters: ListChargesInput = {
    ...chargeFilters,
    page: page ?? 1,
    pageSize: pageSize ?? DEFAULT_LIST_PAGE_SIZE,
  }

  const sheetFilters: ChargeSheetFilters = {
    from: from ?? null,
    to: to ?? null,
    periodAll,
    status,
    billingKind,
    method,
    serviceId: serviceId ?? null,
    overdue,
    patientId: patientId ?? null,
  }

  function resetPage() {
    setPage(1)
  }

  function applySheetFilters(next: ChargeSheetFilters) {
    void setFrom(next.from)
    void setTo(next.to)
    void setPeriodAll(next.periodAll ? true : null)
    void setStatus(next.status)
    void setBillingKind(next.billingKind)
    void setMethod(next.method)
    void setServiceId(next.serviceId)
    void setOverdue(next.overdue || null)
    void setPatientId(next.patientId)
    resetPage()
  }

  return {
    q,
    page,
    pageSize,
    setQ,
    setPage,
    status,
    setStatus: (next: StatusFilter) => {
      void setStatus(next)
      resetPage()
    },
    overdue,
    setOverdue: (next: boolean) => {
      void setOverdue(next || null)
      resetPage()
    },
    from,
    to,
    periodAll,
    setPeriod: (next: {
      from?: string | null
      to?: string | null
      periodAll?: boolean
    }) => {
      void setFrom(next.from ?? null)
      void setTo(next.to ?? null)
      void setPeriodAll(next.periodAll ? true : null)
      resetPage()
    },
    serviceId,
    setServiceId: (next: string | null) => {
      void setServiceId(next)
      resetPage()
    },
    billingKind,
    setBillingKind: (next: (typeof CHARGE_KIND_FILTERS)[number]) => {
      void setBillingKind(next)
      resetPage()
    },
    method,
    setMethod: (next: (typeof CHARGE_METHOD_FILTERS)[number]) => {
      void setMethod(next)
      resetPage()
    },
    patientId,
    setPatientId: (next: string | null) => {
      void setPatientId(next)
      resetPage()
    },
    sheetFilters,
    applySheetFilters,
    chargeFilters,
    listFilters,
  }
}
