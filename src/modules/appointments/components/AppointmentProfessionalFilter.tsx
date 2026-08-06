"use client";

import { QueryErrorState } from "@/components/status/QueryErrorState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { formatProfessionalDisplayName } from "@/modules/professionals/constants/professionals";
import { useProfessionalsForSchedulingQuery } from "@/modules/professionals/hooks/use-professionals";
import type { ProfessionalSchedulingItem } from "@/modules/professionals/types/professional";

type AppointmentProfessionalFilterProps = {
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function toggleProfessionalId(selectedIds: string[], id: string): string[] {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

export function AppointmentProfessionalFilter({
  selectedIds,
  onSelectedIdsChange,
}: AppointmentProfessionalFilterProps) {
  const professionalsQuery = useProfessionalsForSchedulingQuery();
  const professionals = professionalsQuery.data ?? [];

  if (professionalsQuery.isLoading) {
    return (
      <div className="w-full min-w-0 overflow-hidden">
        <ScrollArea
          className="w-full whitespace-nowrap scroll-fade-x"
          aria-busy="true"
          aria-label="Carregando profissionais">
          <div className="flex w-max gap-2 pb-1.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-11 w-40 shrink-0 animate-pulse rounded-full bg-muted"
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (professionalsQuery.isError) {
    return (
      <QueryErrorState
        description="Não foi possível carregar os profissionais."
        onRetry={() => {
          void professionalsQuery.refetch();
        }}
        isRetrying={professionalsQuery.isFetching}
      />
    );
  }

  if (professionals.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col w-full min-w-0 items-end gap-2">
      <div className="w-full min-w-0 flex-1 overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap scroll-fade-x scrollbar-thin">
          <div
            className="flex w-max gap-2 pb-1.5"
            role="group"
            aria-label="Filtrar por profissional">
            {professionals.map((professional) => (
              <ProfessionalFilterChip
                key={professional.id}
                professional={professional}
                pressed={selectedIds.includes(professional.id)}
                onPressedChange={() => {
                  onSelectedIdsChange(
                    toggleProfessionalId(selectedIds, professional.id),
                  );
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {selectedIds.length} profissionais selecionados
        </span>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onSelectedIdsChange([])}>
          Limpar filtro
        </Button>
      </div>
    </div>
  );
}

function ProfessionalFilterChip({
  professional,
  pressed,
  onPressedChange,
}: {
  professional: ProfessionalSchedulingItem;
  pressed: boolean;
  onPressedChange: () => void;
}) {
  const specialty = professional.specialty?.trim() || "Sem especialidade";
  const displayName = formatProfessionalDisplayName({
    fullName: professional.fullName,
    treatmentPronoun: professional.treatmentPronoun,
  });
  const label = `${displayName}, ${specialty}`;

  return (
    <Toggle
      type="button"
      variant="outline"
      size="sm"
      pressed={pressed}
      onPressedChange={onPressedChange}
      aria-label={`Filtrar por ${label}`}
      className={cn(
        "h-auto w-max max-w-56 shrink-0 gap-2 rounded-full px-2 py-1.5 text-left font-normal",
        pressed &&
          "border-primary dark:bg-primary/25! bg-primary/10! dark:text-primary-foreground",
      )}>
      <Avatar size="sm" className="size-6">
        <AvatarFallback className="text-[0.65rem] font-medium">
          {initialsFromName(professional.fullName ?? displayName)}
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-xs font-medium text-foreground">
          {displayName}
        </span>
        <span className="truncate text-[0.7rem] text-muted-foreground">
          {specialty}
        </span>
      </span>
    </Toggle>
  );
}
