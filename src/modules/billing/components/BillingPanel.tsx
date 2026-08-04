"use client"

import { parseAsStringLiteral, useQueryState } from "nuqs"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { BillingSummaryCards } from "@/modules/billing/components/BillingSummaryCards"
import { ChargesTable } from "@/modules/billing/components/ChargesTable"
import { DelinquentPatientsList } from "@/modules/billing/components/DelinquentPatientsList"
import { CHARGE_STATUS_LABELS } from "@/modules/billing/constants/charges"
import { CHARGE_STATUSES } from "@/modules/billing/schemas/charge.schema"
import type { ChargeStatus } from "@/modules/billing/types/charge"
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators"

const STATUS_FILTERS = ["all", ...CHARGE_STATUSES] as const

type StatusFilter = (typeof STATUS_FILTERS)[number]

const VIEWS = ["charges", "delinquents"] as const

type View = (typeof VIEWS)[number]

export function BillingPanel() {
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_FILTERS).withDefault("all"),
  )
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(VIEWS).withDefault("charges"),
  )

  function handleStatusChange(next: StatusFilter) {
    void setStatus(next)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Faturamento
        </h1>
        <p className="text-sm text-muted-foreground">
          Cobranças da clínica por consulta — registre pagamentos recebidos.
        </p>
      </div>

      <BillingSummaryCards
        selectedStatus={status}
        onStatusChange={handleStatusChange}
      />

      <ToggleGroup
        type="single"
        variant="outline"
        value={view}
        onValueChange={(value) => {
          if (!value) return
          void setView(value as View)
          setPage(1)
        }}
        className="self-start"
      >
        <ToggleGroupItem value="charges">Todas as cobranças</ToggleGroupItem>
        <ToggleGroupItem value="delinquents">Inadimplentes</ToggleGroupItem>
      </ToggleGroup>

      {view === "delinquents" ? (
        <DelinquentPatientsList />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <DataTableSearch
                value={q ?? ""}
                onValueChange={setQ}
                placeholder="Buscar por paciente"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                handleStatusChange(value as StatusFilter)
              }}
            >
              <SelectTrigger className="w-full sm:w-44" aria-label="Status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {CHARGE_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {CHARGE_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ChargesTable
            filters={{
              q: q || undefined,
              page: page ?? 1,
              pageSize: pageSize ?? DEFAULT_LIST_PAGE_SIZE,
              status: status === "all" ? undefined : (status as ChargeStatus),
            }}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
