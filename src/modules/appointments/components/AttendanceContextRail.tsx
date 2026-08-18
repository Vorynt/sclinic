"use client";

import {
  ArrowUpRightIcon,
  NotePencilIcon,
  PulseIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { useAttendancePanel } from "@/modules/appointments/hooks/use-attendance-panel";
import type { Appointment } from "@/modules/appointments/types/appointment";
import { usePatientClinicalNotesQuery } from "@/modules/medical-records/hooks/use-clinical-notes";
import {
  usePatientVitalSignsQuery,
  useVitalSignsForAppointmentQuery,
} from "@/modules/medical-records/hooks/use-vital-signs";
import { formatVitalSignsSummary } from "@/modules/medical-records/utils/format-vital-signs";
import { usePatient } from "@/modules/patients/hooks/use-patient";
import { getPatientAgeYears } from "@/modules/patients/utils/patient-age";

type AttendanceContextRailProps = {
  appointment: Appointment;
};

function excerpt(text: string, max = 140): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

export function AttendanceContextRail({
  appointment,
}: AttendanceContextRailProps) {
  const { setPanel } = useAttendancePanel();
  const patientQuery = usePatient(appointment.patientId);
  const currentVitalsQuery = useVitalSignsForAppointmentQuery(appointment.id);
  const historyVitalsQuery = usePatientVitalSignsQuery(
    {
      patientId: appointment.patientId,
      excludeAppointmentId: appointment.id,
    },
    Boolean(appointment.patientId),
  );
  const notesQuery = usePatientClinicalNotesQuery(
    {
      patientId: appointment.patientId,
      excludeAppointmentId: appointment.id,
    },
    Boolean(appointment.patientId),
  );

  const ageYears = patientQuery.data
    ? getPatientAgeYears(patientQuery.data.birthDate)
    : null;
  const currentVitals = currentVitalsQuery.data?.vitals ?? null;
  const lastHistoryVitals = historyVitalsQuery.data?.[0] ?? null;
  const vitals = currentVitals ?? lastHistoryVitals;
  const lastNote = notesQuery.data?.[0] ?? null;
  const isVitalsLoading =
    currentVitalsQuery.isLoading ||
    (currentVitals == null && historyVitalsQuery.isLoading);

  return (
    <aside className="sticky top-20 flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Paciente
        </h2>
        {patientQuery.isLoading ? (
          <Skeleton className="h-4 w-20" />
        ) : (
          <p className="text-sm text-muted-foreground">
            {ageYears != null ? `${ageYears} anos` : "Idade não informada"}
          </p>
        )}
        <Button variant="link" size="sm" className="h-auto w-fit px-0" asChild>
          <Link
            href={routes.patientDetail(appointment.patientId)}
            target="_blank">
            Abrir ficha
            <ArrowUpRightIcon />
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setPanel("patient")}>
          Ver contexto
        </Button>
      </section>

      {appointment.reason ? (
        <RailBlock title="Motivo">{appointment.reason}</RailBlock>
      ) : null}

      {appointment.notes ? (
        <RailBlock title="Observações">{appointment.notes}</RailBlock>
      ) : null}

      <section className="flex flex-col gap-2">
        <h3 className="text-xs text-muted-foreground">Sinais vitais</h3>
        {isVitalsLoading ? (
          <RailVitalsSkeleton />
        ) : vitals ? (
          <div className="flex flex-col gap-2">
            <div className="rounded-md border border-border px-3 py-2 text-sm text-foreground">
              <p className="text-xs text-muted-foreground">
                {currentVitals
                  ? "Nesta consulta"
                  : vitalsDateLabel(vitals.appointmentStartsAt)}
              </p>
              <p className="mt-0.5">{formatCompactVitals(vitals)}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setPanel("vitals")}>
              <PulseIcon />
              Abrir vitais
            </Button>
          </div>
        ) : (
          <Empty className="min-h-0 gap-3 border border-dashed p-4 py-5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PulseIcon weight="duotone" />
              </EmptyMedia>
              <EmptyTitle>Nenhum sinal vital</EmptyTitle>
              <EmptyDescription className="text-xs">
                Não há medições nesta consulta nem no histórico do paciente.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setPanel("vitals")}>
                <PulseIcon />
                Abrir vitais
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs text-muted-foreground">Última anotação</h3>
        {notesQuery.isLoading ? (
          <RailNoteSkeleton />
        ) : lastNote ? (
          <button
            type="button"
            className="rounded-md border border-border px-3 py-2 text-left transition-colors hover:bg-muted/60"
            onClick={() => setPanel("patient")}>
            <p className="text-xs text-muted-foreground">
              {vitalsDateLabel(lastNote.appointmentStartsAt)}
              {lastNote.professionalName
                ? ` · ${lastNote.professionalName}`
                : null}
            </p>
            <p className="mt-0.5 text-sm text-foreground">
              {excerpt(lastNote.plainText)}
            </p>
          </button>
        ) : (
          <Empty className="min-h-0 gap-3 border border-dashed p-4 py-5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <NotePencilIcon weight="duotone" />
              </EmptyMedia>
              <EmptyTitle>Nenhuma anotação anterior</EmptyTitle>
              <EmptyDescription className="text-xs">
                Evoluções de outras consultas aparecem aqui.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </aside>
  );
}

function RailBlock({ title, children }: { title: string; children: string }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-xs text-muted-foreground">{title}</h3>
      <p className="text-sm text-foreground">{children}</p>
    </section>
  );
}

function RailVitalsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando sinais vitais"
      className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5 rounded-md border border-border px-3 py-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  );
}

function RailNoteSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando anotações"
      className="flex flex-col gap-1.5 rounded-md border border-border px-3 py-2">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function vitalsDateLabel(date: Date | null): string {
  if (!date) return "Registro anterior";
  return format(date, "dd MMM yyyy", { locale: ptBR });
}

function formatCompactVitals(
  vitals: Parameters<typeof formatVitalSignsSummary>[0],
): string {
  const rows = formatVitalSignsSummary(vitals);
  if (rows.length === 0) return "Ver medições";
  return rows
    .slice(0, 3)
    .map((row) => row.value)
    .join(" · ");
}
