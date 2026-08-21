"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
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
import type { ChargeSheetFilters } from "@/modules/billing/utils/charge-sheet-filters"
import {
  areChargeSheetFiltersEqual,
  DEFAULT_CHARGE_SHEET_FILTERS,
} from "@/modules/billing/utils/charge-sheet-filters"

type ClinicServiceOption = {
  id: string
  name: string
}

type ChargeFiltersDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: ChargeSheetFilters
  onApply: (next: ChargeSheetFilters) => void
  services: ClinicServiceOption[]
}

export function ChargeFiltersDrawer({
  open,
  onOpenChange,
  value,
  onApply,
  services,
}: ChargeFiltersDrawerProps) {
  const isMobile = useIsMobile()
  const [draft, setDraft] = useState<ChargeSheetFilters>(value)

  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  const draftDirty = !areChargeSheetFiltersEqual(draft, value)

  function handleRestoreDefaults() {
    setDraft(DEFAULT_CHARGE_SHEET_FILTERS)
    onApply(DEFAULT_CHARGE_SHEET_FILTERS)
    onOpenChange(false)
  }

  function handleApply() {
    onApply(draft)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "gap-0 p-0",
          isMobile ? "max-h-[85dvh] rounded-t-xl" : "h-full w-full sm:max-w-md",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="shrink-0 border-b">
            <SheetTitle>Filtros do faturamento</SheetTitle>
            <SheetDescription>
              Refine por período, status, serviço e forma de pagamento.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-6 p-4">
              <section className="flex flex-col gap-2">
                <Label htmlFor="charge-filter-period">Período personalizado</Label>
                <DateRangePicker
                  id="charge-filter-period"
                  modal
                  numberOfMonths={1}
                  side={isMobile ? "top" : "bottom"}
                  className="w-full"
                  placeholder="Selecione o período"
                  value={{
                    from: draft.from ?? undefined,
                    to: draft.to ?? undefined,
                  }}
                  onChange={(range) => {
                    setDraft((current) => ({
                      ...current,
                      periodAll: false,
                      from: range.from ?? null,
                      to: range.to ?? null,
                    }))
                  }}
                />
              </section>

              <section className="flex flex-col gap-2">
                <Label htmlFor="charge-filter-status">Status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(next) => {
                    setDraft((current) => ({
                      ...current,
                      status: next as ChargeSheetFilters["status"],
                    }))
                  }}
                >
                  <SelectTrigger id="charge-filter-status" className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {CHARGE_STATUSES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {CHARGE_STATUS_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section className="flex flex-col gap-2">
                <Label htmlFor="charge-filter-kind">Tipo</Label>
                <Select
                  value={draft.billingKind}
                  onValueChange={(next) => {
                    setDraft((current) => ({
                      ...current,
                      billingKind: next as ChargeSheetFilters["billingKind"],
                    }))
                  }}
                >
                  <SelectTrigger id="charge-filter-kind" className="w-full">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {BILLING_KINDS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {BILLING_KIND_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section className="flex flex-col gap-2">
                <Label htmlFor="charge-filter-method">Forma de pagamento</Label>
                <Select
                  value={draft.method}
                  onValueChange={(next) => {
                    setDraft((current) => ({
                      ...current,
                      method: next as ChargeSheetFilters["method"],
                    }))
                  }}
                >
                  <SelectTrigger id="charge-filter-method" className="w-full">
                    <SelectValue placeholder="Pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as formas</SelectItem>
                    {PAYMENT_METHODS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {PAYMENT_METHOD_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section className="flex flex-col gap-2">
                <Label htmlFor="charge-filter-service">Serviço</Label>
                <Select
                  value={draft.serviceId ?? "all"}
                  onValueChange={(next) => {
                    setDraft((current) => ({
                      ...current,
                      serviceId: next === "all" ? null : next,
                    }))
                  }}
                >
                  <SelectTrigger id="charge-filter-service" className="w-full">
                    <SelectValue placeholder="Serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os serviços</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={draft.overdue}
                  onCheckedChange={(checked) => {
                    setDraft((current) => ({
                      ...current,
                      overdue: checked === true,
                    }))
                  }}
                />
                Somente vencidas
              </label>

              {draft.patientId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() => {
                    setDraft((current) => ({ ...current, patientId: null }))
                  }}
                >
                  Paciente filtrado
                </Button>
              ) : null}
            </div>
          </div>

          <SheetFooter className="shrink-0 border-t sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              onClick={handleRestoreDefaults}
              disabled={
                areChargeSheetFiltersEqual(draft, DEFAULT_CHARGE_SHEET_FILTERS) &&
                areChargeSheetFiltersEqual(value, DEFAULT_CHARGE_SHEET_FILTERS)
              }
            >
              Restaurar padrões
            </Button>
            <Button
              type="button"
              className="sm:flex-1"
              onClick={handleApply}
              disabled={!draftDirty}
            >
              Aplicar filtros
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
