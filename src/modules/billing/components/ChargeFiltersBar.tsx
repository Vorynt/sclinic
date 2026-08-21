"use client";

import { FunnelIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { DataTableSearch } from "@/components/data-table/DataTableSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChargeFiltersDrawer } from "@/modules/billing/components/ChargeFiltersDrawer";
import { useChargeListFilters } from "@/modules/billing/hooks/use-charge-list-filters";
import {
  useActiveClinicServicesQuery,
  useClinicServiceQuery,
} from "@/modules/billing/hooks/use-clinic-services";
import type { BillingInsights } from "@/modules/billing/types/charge";
import {
  currentYearIsoRange,
  lastDaysIsoRange,
  previousMonthIsoRange,
} from "@/modules/billing/utils/charge-period";
import type {
  ChargePeriodPreset,
  ChargeSheetFilterChip,
} from "@/modules/billing/utils/charge-sheet-filters";
import {
  countChargeSheetFilters,
  listChargeSheetFilterChips,
  resolveChargePeriodPreset,
} from "@/modules/billing/utils/charge-sheet-filters";

type ChargeFiltersBarProps = {
  filters: ReturnType<typeof useChargeListFilters>;
  period?: BillingInsights["period"];
};

export function ChargeFiltersBar({ filters, period }: ChargeFiltersBarProps) {
  const [open, setOpen] = useState(false);
  const servicesQuery = useActiveClinicServicesQuery();
  const services = servicesQuery.data ?? [];
  const serviceQuery = useClinicServiceQuery(filters.serviceId ?? "", {
    enabled: Boolean(filters.serviceId),
  });
  const timeZone = period?.timeZone ?? "America/Sao_Paulo";
  const now = new Date();

  const presetValue = resolveChargePeriodPreset({
    from: filters.from,
    to: filters.to,
    periodAll: filters.periodAll,
    timeZone,
    now,
  });
  const activeFilterCount = countChargeSheetFilters(filters.sheetFilters, {
    timeZone,
    now,
  });
  const chips = listChargeSheetFilterChips(filters.sheetFilters, {
    timeZone,
    now,
    serviceName: serviceQuery.data?.name,
  });

  function applyPreset(preset: Exclude<ChargePeriodPreset, "custom">) {
    if (preset === "all") {
      filters.setPeriod({ from: null, to: null, periodAll: true });
      return;
    }
    if (preset === "this-month") {
      filters.setPeriod({ from: null, to: null, periodAll: false });
      return;
    }
    const range =
      preset === "last-month"
        ? previousMonthIsoRange(now, timeZone)
        : preset === "last-30"
          ? lastDaysIsoRange(now, timeZone, 30)
          : currentYearIsoRange(now, timeZone);
    filters.setPeriod({ ...range, periodAll: false });
  }

  function clearChip(chip: ChargeSheetFilterChip) {
    if (chip.key === "period") {
      filters.setPeriod({ from: null, to: null, periodAll: false });
      return;
    }
    if (chip.key === "status") {
      filters.setStatus("all");
      return;
    }
    if (chip.key === "billingKind") {
      filters.setBillingKind("all");
      return;
    }
    if (chip.key === "method") {
      filters.setMethod("all");
      return;
    }
    if (chip.key === "serviceId") {
      filters.setServiceId(null);
      return;
    }
    if (chip.key === "overdue") {
      filters.setOverdue(false);
      return;
    }
    filters.setPatientId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <DataTableSearch
            value={filters.q ?? ""}
            onValueChange={filters.setQ}
            placeholder="Buscar por paciente"
            className="max-w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={presetValue}
            onValueChange={(value) => {
              if (value === "custom") {
                setOpen(true);
                return;
              }
              applyPreset(value as Exclude<ChargePeriodPreset, "custom">);
            }}>
            <SelectTrigger className="h-8 w-full lg:w-44" aria-label="Período">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">Este mês</SelectItem>
              <SelectItem value="last-month">Mês passado</SelectItem>
              <SelectItem value="last-30">Últimos 30 dias</SelectItem>
              <SelectItem value="this-year">Este ano</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            aria-pressed={activeFilterCount > 0 || undefined}
            className={cn(
              "h-8 shrink-0",
              activeFilterCount > 0 &&
                "border-primary/50 bg-primary/5 text-primary",
            )}
            onClick={() => setOpen(true)}>
            <FunnelIcon />
            Filtros
            {activeFilterCount > 0 ? (
              <Badge
                variant="info"
                className="h-5 min-w-5 justify-center px-1.5">
                {activeFilterCount}
              </Badge>
            ) : null}
          </Button>
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Button
              key={chip.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => clearChip(chip)}>
              {chip.label}
              <XIcon />
            </Button>
          ))}
        </div>
      ) : null}

      <ChargeFiltersDrawer
        open={open}
        onOpenChange={setOpen}
        value={filters.sheetFilters}
        onApply={filters.applySheetFilters}
        services={services}
      />
    </div>
  );
}
