"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useDelinquentPatientsQuery } from "@/modules/billing/hooks/use-charges";
import { formatCentsToBrl } from "@/modules/billing/utils/money";

function DelinquentPatientsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5"
        >
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Patients with at least one overdue pending charge, grouped by patient. */
export function DelinquentPatientsList() {
  const delinquentsQuery = useDelinquentPatientsQuery();

  if (delinquentsQuery.isLoading) {
    return <DelinquentPatientsSkeleton />;
  }

  if (delinquentsQuery.isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os inadimplentes.
      </p>
    );
  }

  const patients = delinquentsQuery.data ?? [];

  if (patients.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Nenhum inadimplente</EmptyTitle>
          <EmptyDescription>
            Nenhum paciente com cobrança pendente vencida no momento.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {patients.map((patient) => (
        <div
          key={patient.patientId}
          className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <WarningCircleIcon className="size-4" weight="duotone" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {patient.patientName}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {patient.count === 1
                ? "1 cobrança vencida"
                : `${patient.count} cobranças vencidas`}
              <span className="mx-1.5 text-border">·</span>
              Vencida desde{" "}
              {format(patient.oldestDueAt, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>

          <Badge variant="destructive" className="shrink-0 tabular-nums">
            {formatCentsToBrl(patient.totalCents)}
          </Badge>
        </div>
      ))}
    </div>
  );
}
