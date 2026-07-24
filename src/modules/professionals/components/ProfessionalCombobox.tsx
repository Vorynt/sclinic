"use client";

import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  formatProfessionalDisplayName,
  formatProfessionalSchedulingLabel,
} from "@/modules/professionals/constants/professionals";
import { useProfessionalsForSchedulingQuery } from "@/modules/professionals/hooks/use-professionals";
import type { ProfessionalSchedulingItem } from "@/modules/professionals/types/professional";

const MIN_SEARCH_CHARS = 3;

type ProfessionalComboboxProps = {
  value: string;
  onValueChange: (professionalId: string) => void;
  /** Label known by the parent (e.g. locked self-schedule) while the list refetches. */
  displayLabel?: string | null;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
};

export function ProfessionalCombobox({
  value,
  onValueChange,
  displayLabel,
  disabled = false,
  "aria-invalid": ariaInvalid,
  className,
}: ProfessionalComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    displayLabel ?? null,
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const canSearch = debouncedSearch.length >= MIN_SEARCH_CHARS;
  const professionalsQuery = useProfessionalsForSchedulingQuery(
    canSearch ? { q: debouncedSearch } : undefined,
    { enabled: canSearch },
  );
  const professionals = canSearch ? (professionalsQuery.data ?? []) : [];

  useEffect(() => {
    if (!value) {
      setSelectedLabel(null);
      return;
    }
    if (displayLabel) {
      setSelectedLabel(displayLabel);
      return;
    }
    const match = professionals.find(
      (professional) => professional.id === value,
    );
    if (match) {
      setSelectedLabel(
        formatProfessionalSchedulingLabel({
          fullName: match.fullName,
          treatmentPronoun: match.treatmentPronoun,
          specialty: match.specialty,
        }),
      );
    }
  }, [displayLabel, professionals, value]);

  function handleSelect(professional: ProfessionalSchedulingItem) {
    onValueChange(professional.id);
    setSelectedLabel(
      formatProfessionalSchedulingLabel({
        fullName: professional.fullName,
        treatmentPronoun: professional.treatmentPronoun,
        specialty: professional.specialty,
      }),
    );
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch("");
      }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid || undefined}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}>
          <span className="truncate">
            {selectedLabel ?? "Buscar profissional por nome ou especialidade"}
          </span>
          <CaretUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Digite ao menos 3 caracteres"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {!canSearch ? (
              <div className="flex flex-col items-center gap-2 px-2 py-6 text-sm text-muted-foreground">
                <span>Digite ao menos 3 caracteres para buscar.</span>
              </div>
            ) : professionalsQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Spinner />
                Buscando...
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 px-2">
                    <span>Nenhum profissional encontrado.</span>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {professionals.map((professional) => {
                    const displayName = formatProfessionalDisplayName({
                      fullName: professional.fullName,
                      treatmentPronoun: professional.treatmentPronoun,
                    });
                    return (
                      <CommandItem
                        key={professional.id}
                        value={`${displayName} ${professional.specialty ?? ""}`}
                        data-checked={value === professional.id || undefined}
                        onSelect={() => handleSelect(professional)}>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate">{displayName}</span>
                          {professional.specialty ? (
                            <span className="truncate text-xs text-muted-foreground">
                              {professional.specialty}
                            </span>
                          ) : null}
                        </div>
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            value === professional.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
