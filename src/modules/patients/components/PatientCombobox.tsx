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
import { usePatientsQuery } from "@/modules/patients/hooks/use-patients";
import type { Patient } from "@/modules/patients/types/patient";
import { formatCpf } from "@/utils/cpf";

type PatientComboboxProps = {
  value: string;
  onValueChange: (patientId: string) => void;
  /** Label known by the parent (e.g. after inline create) while the list refetches. */
  displayLabel?: string | null;
  onCreatePatient?: () => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
};

export function PatientCombobox({
  value,
  onValueChange,
  displayLabel,
  onCreatePatient,
  disabled = false,
  "aria-invalid": ariaInvalid,
  className,
}: PatientComboboxProps) {
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

  const patientsQuery = usePatientsQuery(
    debouncedSearch ? { q: debouncedSearch } : undefined,
  );
  const patients = patientsQuery.data ?? [];

  useEffect(() => {
    if (!value) {
      setSelectedLabel(null);
      return;
    }
    if (displayLabel) {
      setSelectedLabel(displayLabel);
      return;
    }
    const match = patients.find((patient) => patient.id === value);
    if (match) {
      setSelectedLabel(match.name);
    }
  }, [displayLabel, patients, value]);

  function handleSelect(patient: Patient) {
    onValueChange(patient.id);
    setSelectedLabel(patient.name);
    setOpen(false);
    setSearch("");
  }

  function handleCreatePatient() {
    setOpen(false);
    onCreatePatient?.();
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
            {selectedLabel ?? "Buscar paciente por nome ou CPF"}
          </span>
          <CaretUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nome ou CPF"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {patientsQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Spinner />
                Buscando...
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 px-2">
                    <span>Nenhum paciente encontrado.</span>
                    {onCreatePatient ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCreatePatient}>
                        Cadastrar paciente
                      </Button>
                    ) : null}
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {patients.map((patient) => (
                    <CommandItem
                      key={patient.id}
                      value={`${patient.name} ${patient.cpf}`}
                      data-checked={value === patient.id || undefined}
                      onSelect={() => handleSelect(patient)}>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{patient.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {formatCpf(patient.cpf)}
                        </span>
                      </div>
                      <CheckIcon
                        className={cn(
                          "ml-auto",
                          value === patient.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
          {onCreatePatient && patients.length > 0 ? (
            <div className="border-t p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={handleCreatePatient}>
                Cadastrar novo paciente
              </Button>
            </div>
          ) : null}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
