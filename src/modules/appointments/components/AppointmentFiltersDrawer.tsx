"use client";

import { FunnelIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { QueryErrorState } from "@/components/status/QueryErrorState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { APPOINTMENT_MODALITY_LABELS } from "@/modules/appointments/constants/appointments";
import type { AppointmentModality } from "@/modules/appointments/types/appointment";
import { usePatientsQuery } from "@/modules/patients/hooks/use-patients";
import { formatProfessionalDisplayName } from "@/modules/professionals/constants/professionals";
import { useProfessionalsForSchedulingQuery } from "@/modules/professionals/hooks/use-professionals";
import type { ProfessionalSchedulingItem } from "@/modules/professionals/types/professional";
import { formatCpf } from "@/utils/cpf";

const PATIENT_MIN_SEARCH_CHARS = 3;

export type AppointmentModalityFilter = AppointmentModality | "all";

export type AppointmentFiltersValue = {
  professionalIds: string[];
  patientIds: string[];
  modality: AppointmentModalityFilter;
};

type AppointmentFiltersDrawerProps = {
  value: AppointmentFiltersValue;
  onValueChange: (value: AppointmentFiltersValue) => void;
  showProfessionalFilter?: boolean;
};

type PatientOption = {
  id: string;
  name: string;
  cpf: string;
};

const DEFAULT_FILTERS: AppointmentFiltersValue = {
  professionalIds: [],
  patientIds: [],
  modality: "all",
};

const MODALITY_OPTIONS: {
  value: AppointmentModalityFilter;
  label: string;
}[] = [
  { value: "all", label: "Todas" },
  {
    value: "in_person",
    label: APPOINTMENT_MODALITY_LABELS.in_person,
  },
  {
    value: "online",
    label: APPOINTMENT_MODALITY_LABELS.online,
  },
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id)
    ? ids.filter((selectedId) => selectedId !== id)
    : [...ids, id];
}

function countActiveFilters(
  value: AppointmentFiltersValue,
  showProfessionalFilter: boolean,
): number {
  let count = 0;
  if (showProfessionalFilter && value.professionalIds.length > 0) count += 1;
  if (value.patientIds.length > 0) count += 1;
  if (value.modality !== "all") count += 1;
  return count;
}

function areFiltersEqual(
  a: AppointmentFiltersValue,
  b: AppointmentFiltersValue,
): boolean {
  if (a.modality !== b.modality) return false;
  if (a.professionalIds.length !== b.professionalIds.length) return false;
  if (a.patientIds.length !== b.patientIds.length) return false;
  const professionalsA = [...a.professionalIds].sort();
  const professionalsB = [...b.professionalIds].sort();
  if (professionalsA.some((id, index) => id !== professionalsB[index])) {
    return false;
  }
  const patientsA = [...a.patientIds].sort();
  const patientsB = [...b.patientIds].sort();
  return patientsA.every((id, index) => id === patientsB[index]);
}

export function AppointmentFiltersDrawer({
  value,
  onValueChange,
  showProfessionalFilter = true,
}: AppointmentFiltersDrawerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AppointmentFiltersValue>(value);
  const [professionalSearch, setProfessionalSearch] = useState("");
  const [debouncedProfessionalSearch, setDebouncedProfessionalSearch] =
    useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [debouncedPatientSearch, setDebouncedPatientSearch] = useState("");
  const [patientLabels, setPatientLabels] = useState<
    Record<string, PatientOption>
  >({});

  const activeFilterCount = countActiveFilters(value, showProfessionalFilter);
  const hasActiveFilters = activeFilterCount > 0;

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedProfessionalSearch(professionalSearch.trim()),
      300,
    );
    return () => clearTimeout(timeout);
  }, [professionalSearch]);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedPatientSearch(patientSearch.trim()),
      300,
    );
    return () => clearTimeout(timeout);
  }, [patientSearch]);

  const professionalsQuery = useProfessionalsForSchedulingQuery(
    debouncedProfessionalSearch
      ? { q: debouncedProfessionalSearch }
      : undefined,
    { enabled: showProfessionalFilter && open },
  );
  const professionals = professionalsQuery.data ?? [];

  const canSearchPatients =
    debouncedPatientSearch.length >= PATIENT_MIN_SEARCH_CHARS;
  const patientsQuery = usePatientsQuery(
    canSearchPatients ? { q: debouncedPatientSearch } : undefined,
    { enabled: open && canSearchPatients },
  );
  const patients = canSearchPatients ? (patientsQuery.data?.items ?? []) : [];

  const selectedPatients = useMemo(() => {
    return draft.patientIds
      .map((id) => patientLabels[id])
      .filter((patient): patient is PatientOption => Boolean(patient));
  }, [draft.patientIds, patientLabels]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(value);
      setProfessionalSearch("");
      setPatientSearch("");
      setPatientLabels((current) => {
        const next: Record<string, PatientOption> = {};
        for (const id of value.patientIds) {
          if (current[id]) next[id] = current[id]!;
        }
        return next;
      });
    }
    setOpen(nextOpen);
  }

  function handleRestoreDefaults() {
    setDraft(DEFAULT_FILTERS);
    setPatientLabels({});
    onValueChange(DEFAULT_FILTERS);
    setOpen(false);
  }

  function handleApply() {
    onValueChange(draft);
    setPatientLabels((current) => {
      const next: Record<string, PatientOption> = {};
      for (const id of draft.patientIds) {
        if (current[id]) next[id] = current[id]!;
      }
      return next;
    });
    setOpen(false);
  }

  function handleToggleProfessional(id: string) {
    setDraft((current) => ({
      ...current,
      professionalIds: toggleId(current.professionalIds, id),
    }));
  }

  function handleTogglePatient(patient: PatientOption) {
    const isSelected = draft.patientIds.includes(patient.id);
    if (isSelected) {
      setPatientLabels((current) => {
        const next = { ...current };
        delete next[patient.id];
        return next;
      });
    } else {
      setPatientLabels((current) => ({
        ...current,
        [patient.id]: patient,
      }));
    }
    setDraft((current) => ({
      ...current,
      patientIds: toggleId(current.patientIds, patient.id),
    }));
  }

  const draftDirty = !areFiltersEqual(draft, value);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-pressed={hasActiveFilters || undefined}
          className={cn(
            hasActiveFilters && "border-primary/50 bg-primary/5 text-primary",
          )}>
          <FunnelIcon />
          Filtros
          {hasActiveFilters ? (
            <Badge variant="info" className="h-5 min-w-5 justify-center px-1.5">
              {activeFilterCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "gap-0 p-0",
          isMobile ? "max-h-[85dvh] rounded-t-xl" : "h-full w-full sm:max-w-md",
        )}>
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="shrink-0 border-b">
            <SheetTitle>Filtros da agenda</SheetTitle>
            <SheetDescription>
              Refine por profissional, tipo de agendamento e paciente.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-6 p-4">
              <section className="flex flex-col gap-3">
                <Label>Tipo de agendamento</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={draft.modality}
                  onValueChange={(next) => {
                    if (!next) return;
                    setDraft((current) => ({
                      ...current,
                      modality: next as AppointmentModalityFilter,
                    }));
                  }}
                  aria-label="Filtrar por tipo de agendamento"
                  className="w-full justify-start">
                  <ButtonGroup className="w-full sm:w-auto">
                    {MODALITY_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="flex-1 sm:flex-none">
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ButtonGroup>
                </ToggleGroup>
              </section>

              {showProfessionalFilter ? (
                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="appointment-filter-professional-search">
                      Profissional
                    </Label>
                    {draft.professionalIds.length > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {draft.professionalIds.length} selecionado
                        {draft.professionalIds.length === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>
                  <div className="relative">
                    <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="appointment-filter-professional-search"
                      value={professionalSearch}
                      onChange={(event) =>
                        setProfessionalSearch(event.target.value)
                      }
                      placeholder="Buscar profissional"
                      className="pl-8"
                    />
                  </div>
                  <ProfessionalFilterList
                    professionals={professionals}
                    selectedIds={draft.professionalIds}
                    onToggle={handleToggleProfessional}
                    isLoading={professionalsQuery.isLoading}
                    isError={professionalsQuery.isError}
                    isFetching={professionalsQuery.isFetching}
                    onRetry={() => {
                      void professionalsQuery.refetch();
                    }}
                    emptyLabel={
                      debouncedProfessionalSearch
                        ? "Nenhum profissional encontrado."
                        : "Nenhum profissional disponível."
                    }
                  />
                </section>
              ) : null}

              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="appointment-filter-patient-search">
                    Paciente
                  </Label>
                  {draft.patientIds.length > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {draft.patientIds.length} selecionado
                      {draft.patientIds.length === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="appointment-filter-patient-search"
                    value={patientSearch}
                    onChange={(event) => setPatientSearch(event.target.value)}
                    placeholder="Buscar por nome ou CPF"
                    className="pl-8"
                  />
                </div>
                <PatientFilterList
                  patients={patients}
                  selectedPatients={selectedPatients}
                  selectedIds={draft.patientIds}
                  onToggle={handleTogglePatient}
                  canSearch={canSearchPatients}
                  isLoading={patientsQuery.isLoading}
                  isError={patientsQuery.isError}
                  isFetching={patientsQuery.isFetching}
                  onRetry={() => {
                    void patientsQuery.refetch();
                  }}
                />
              </section>
            </div>
          </div>

          <SheetFooter className="shrink-0 border-t sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              onClick={handleRestoreDefaults}
              disabled={
                areFiltersEqual(draft, DEFAULT_FILTERS) &&
                areFiltersEqual(value, DEFAULT_FILTERS)
              }>
              Restaurar padrões
            </Button>
            <Button
              type="button"
              className="sm:flex-1"
              onClick={handleApply}
              disabled={!draftDirty}>
              Aplicar filtros
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProfessionalFilterList({
  professionals,
  selectedIds,
  onToggle,
  isLoading,
  isError,
  isFetching,
  onRetry,
  emptyLabel,
}: {
  professionals: ProfessionalSchedulingItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
  emptyLabel: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border py-8 text-sm text-muted-foreground">
        <Spinner />
        Carregando...
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        description="Não foi possível carregar os profissionais."
        onRetry={onRetry}
        isRetrying={isFetching}
      />
    );
  }

  if (professionals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      className="max-h-56 overflow-y-auto rounded-lg border"
      role="group"
      aria-label="Filtrar por profissional">
      <ul className="divide-y">
        {professionals.map((professional) => {
          const displayName = formatProfessionalDisplayName({
            fullName: professional.fullName,
            treatmentPronoun: professional.treatmentPronoun,
          });
          const specialty =
            professional.specialty?.trim() || "Sem especialidade";
          const checked = selectedIds.includes(professional.id);
          const checkboxId = `appointment-filter-professional-${professional.id}`;

          return (
            <li key={professional.id}>
              <label
                htmlFor={checkboxId}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50",
                  checked && "bg-primary/5",
                )}>
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  onCheckedChange={() => onToggle(professional.id)}
                />
                <Avatar size="sm" className="size-7">
                  <AvatarFallback className="text-[0.65rem] font-medium">
                    {initialsFromName(professional.fullName ?? displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium text-foreground">
                    {displayName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {specialty}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PatientFilterList({
  patients,
  selectedPatients,
  selectedIds,
  onToggle,
  canSearch,
  isLoading,
  isError,
  isFetching,
  onRetry,
}: {
  patients: { id: string; name: string; cpf: string }[];
  selectedPatients: PatientOption[];
  selectedIds: string[];
  onToggle: (patient: PatientOption) => void;
  canSearch: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
}) {
  const selectedNotInResults = selectedPatients.filter(
    (patient) => !patients.some((item) => item.id === patient.id),
  );
  const listPatients = [...selectedNotInResults, ...patients];

  if (!canSearch && selectedPatients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
        Digite ao menos {PATIENT_MIN_SEARCH_CHARS} caracteres para buscar.
      </div>
    );
  }

  if (canSearch && isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border py-8 text-sm text-muted-foreground">
        <Spinner />
        Buscando...
      </div>
    );
  }

  if (canSearch && isError) {
    return (
      <QueryErrorState
        description="Não foi possível carregar os pacientes."
        onRetry={onRetry}
        isRetrying={isFetching}
      />
    );
  }

  if (canSearch && listPatients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
        Nenhum paciente encontrado.
      </div>
    );
  }

  if (listPatients.length === 0) {
    return null;
  }

  return (
    <div
      className="max-h-56 overflow-y-auto rounded-lg border"
      role="group"
      aria-label="Filtrar por paciente">
      <ul className="divide-y">
        {listPatients.map((patient) => {
          const checked = selectedIds.includes(patient.id);
          const checkboxId = `appointment-filter-patient-${patient.id}`;

          return (
            <li key={patient.id}>
              <label
                htmlFor={checkboxId}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50",
                  checked && "bg-primary/5",
                )}>
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  onCheckedChange={() =>
                    onToggle({
                      id: patient.id,
                      name: patient.name,
                      cpf: patient.cpf,
                    })
                  }
                />
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium text-foreground">
                    {patient.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {formatCpf(patient.cpf)}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
