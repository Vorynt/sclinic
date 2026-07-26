"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/modules/appointments/constants/appointments";
import { useAppointmentQuery } from "@/modules/appointments/hooks/use-appointment";
import type { AppointmentStatus } from "@/modules/appointments/types/appointment";
import { PatientCompactSummary } from "@/modules/patients/components/PatientCompactSummary";

type AppointmentPeekSheetProps = {
  appointmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function statusBadgeVariant(
  status: AppointmentStatus,
): "secondary" | "outline" | "destructive" {
  if (status === "canceled" || status === "no_show") return "destructive";
  if (status === "completed") return "secondary";
  return "outline";
}

function AppointmentPeekSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-md" />
    </div>
  );
}

/**
 * Read-only appointment peek for cross-module surfaces (e.g. billing).
 * Avoids the full agenda drawer (actions + charge summary) and circular imports.
 */
export function AppointmentPeekSheet({
  appointmentId,
  open,
  onOpenChange,
}: AppointmentPeekSheetProps) {
  const appointmentQuery = useAppointmentQuery(appointmentId ?? undefined);
  const appointment = appointmentQuery.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 p-0">
        {appointmentQuery.isLoading ? (
          <>
            <SheetHeader className="sr-only">
              <SheetTitle>Carregando consulta</SheetTitle>
              <SheetDescription>
                Buscando detalhes do agendamento.
              </SheetDescription>
            </SheetHeader>
            <AppointmentPeekSkeleton />
          </>
        ) : null}

        {appointmentQuery.isError || (!appointmentQuery.isLoading && !appointment) ? (
          <div className="px-4 py-6">
            <SheetHeader className="p-0">
              <SheetTitle>Consulta</SheetTitle>
              <SheetDescription>
                Não foi possível carregar os detalhes do agendamento.
              </SheetDescription>
            </SheetHeader>
          </div>
        ) : null}

        {appointment ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b px-4 pb-4 pt-4 pr-12">
              <SheetHeader className="gap-1 p-0">
                <SheetTitle>{appointment.patientName}</SheetTitle>
                <SheetDescription>
                  {format(
                    appointment.startsAt,
                    "EEEE, dd 'de' MMMM 'de' yyyy",
                    { locale: ptBR },
                  )}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={statusBadgeVariant(appointment.status)}>
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </Badge>
                <Badge variant="outline">
                  {APPOINTMENT_TYPE_LABELS[appointment.type]}
                </Badge>
              </div>

              <dl className="mt-3 flex flex-col gap-2 text-sm">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">Profissional</dt>
                  <dd className="font-medium text-foreground">
                    {appointment.professionalName ?? "Não atribuído"}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">Horário</dt>
                  <dd className="font-medium text-foreground">
                    {format(appointment.startsAt, "dd/MM/yyyy")} ·{" "}
                    {format(appointment.startsAt, "HH:mm")}–
                    {format(appointment.endsAt, "HH:mm")}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                <PatientCompactSummary patientId={appointment.patientId} />

                {appointment.reason ||
                appointment.notes ||
                (appointment.status === "canceled" &&
                  appointment.canceledReason) ? (
                  <dl className="flex flex-col gap-3 text-sm">
                    {appointment.reason ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs text-muted-foreground">Motivo</dt>
                        <dd className="text-foreground">{appointment.reason}</dd>
                      </div>
                    ) : null}
                    {appointment.notes ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs text-muted-foreground">
                          Observações
                        </dt>
                        <dd className="text-foreground">{appointment.notes}</dd>
                      </div>
                    ) : null}
                    {appointment.status === "canceled" &&
                    appointment.canceledReason ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs text-muted-foreground">
                          Motivo do cancelamento
                        </dt>
                        <dd className="text-foreground">
                          {appointment.canceledReason}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
