"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AppointmentModality } from "@/modules/appointments/types/appointment";
import type { CalendarViewMode } from "@/modules/appointments/utils/calendar-range";

type AppointmentModalityFilter = AppointmentModality | "all";

type AppointmentsToolbarProps = {
  mode: CalendarViewMode;
  onModeChange: (mode: CalendarViewMode) => void;
  periodLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  modality?: AppointmentModalityFilter;
  onModalityChange?: (modality: AppointmentModalityFilter) => void;
};

const VIEW_MODE_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: "month", label: "Mês" },
  { value: "week", label: "Semana" },
  { value: "day", label: "Dia" },
];

const MODALITY_OPTIONS: { value: AppointmentModalityFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "in_person", label: "Presencial" },
  { value: "online", label: "Online" },
];

export function AppointmentsToolbar({
  mode,
  onModeChange,
  periodLabel,
  onPrevious,
  onNext,
  onToday,
  modality,
  onModalityChange,
}: AppointmentsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Período anterior"
            onClick={onPrevious}>
            <CaretLeftIcon />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onToday}>
            Hoje
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Próximo período"
            onClick={onNext}>
            <CaretRightIcon />
          </Button>
        </ButtonGroup>

        <span className="font-heading text-sm font-medium text-foreground capitalize sm:text-base">
          {periodLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onModalityChange ? (
          <ToggleGroup
            type="single"
            variant="outline"
            value={modality ?? "all"}
            onValueChange={(value) => {
              if (value) onModalityChange(value as AppointmentModalityFilter);
            }}
            aria-label="Filtrar por modalidade">
            <ButtonGroup>
              {MODALITY_OPTIONS.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ButtonGroup>
          </ToggleGroup>
        ) : null}

        <ToggleGroup
          type="single"
          variant="outline"
          value={mode}
          onValueChange={(value) => {
            if (value) onModeChange(value as CalendarViewMode);
          }}
          aria-label="Modo de visualização">
          <ButtonGroup>
            {VIEW_MODE_OPTIONS.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ButtonGroup>
        </ToggleGroup>
      </div>
    </div>
  );
}
