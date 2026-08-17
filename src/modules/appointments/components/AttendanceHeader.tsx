"use client";

import { LockSimpleIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  canCompleteAttendance,
  canPerformThisAttendance,
  COMPLETE_ATTENDANCE_DENIED_TOOLTIP,
} from "@/modules/appointments/constants/appointments";
import { useAgendaReturnHref } from "@/modules/appointments/hooks/use-agenda-return-href";
import { useOwnProfessionalIdQuery } from "@/modules/appointments/hooks/use-appointment";
import { useUpdateAppointmentStatusMutation } from "@/modules/appointments/hooks/use-appointment-mutations";
import type {
  Appointment,
  AppointmentStatus,
} from "@/modules/appointments/types/appointment";
import { useAuthSession } from "@/modules/authentication/hooks/use-auth";
import { PatientClinicalAlertBadges } from "@/modules/medical-records/components/PatientClinicalAlertBadges";

type AttendanceHeaderProps = {
  appointment: Appointment;
};

function statusBadgeVariant(
  status: AppointmentStatus,
): "secondary" | "outline" | "destructive" {
  if (status === "canceled" || status === "no_show") return "destructive";
  if (status === "completed") return "secondary";
  if (status === "checked_in") return "outline";
  return "outline";
}

export function AttendanceHeader({ appointment }: AttendanceHeaderProps) {
  const router = useRouter();
  const agendaHref = useAgendaReturnHref();
  const sessionQuery = useAuthSession();
  const ownProfessionalIdQuery = useOwnProfessionalIdQuery();

  const [completeOpen, setCompleteOpen] = useState(false);
  const [afterCompleteOpen, setAfterCompleteOpen] = useState(false);

  const completeAttendance = useUpdateAppointmentStatusMutation({
    onSuccess: () => {
      toast.success("Atendimento concluído");
      setCompleteOpen(false);
      setAfterCompleteOpen(true);
    },
    onError: (error) => toast.error(error.message),
  });

  const isCompletePermissionPending =
    sessionQuery.isPending || ownProfessionalIdQuery.isPending;
  const canCompleteStatus = canCompleteAttendance(appointment.status);
  const canComplete =
    canCompleteStatus &&
    canPerformThisAttendance({
      roleKey: sessionQuery.data?.membership?.roleKey,
      appointmentProfessionalId: appointment.professionalId,
      ownProfessionalId: ownProfessionalIdQuery.data ?? null,
    });
  const completeLocked =
    canCompleteStatus && !isCompletePermissionPending && !canComplete;

  return (
    <>
      <header className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              {appointment.patientName}
            </h1>
            <Badge variant={statusBadgeVariant(appointment.status)}>
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </Badge>
            <Badge variant="outline">
              {APPOINTMENT_TYPE_LABELS[appointment.type]}
            </Badge>
          </div>

          <PatientClinicalAlertBadges patientId={appointment.patientId} />

          <p className="text-sm text-muted-foreground">
            {format(appointment.startsAt, "EEEE, dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}{" "}
            · {format(appointment.startsAt, "HH:mm")}–
            {format(appointment.endsAt, "HH:mm")}
            {appointment.professionalName
              ? ` · ${appointment.professionalName}`
              : null}
          </p>
        </div>

        {canCompleteStatus ? (
          <Button
            type="button"
            disabled={
              completeAttendance.isPending ||
              isCompletePermissionPending ||
              completeLocked
            }
            className="disabled:bg-muted"
            tooltip={
              completeLocked ? COMPLETE_ATTENDANCE_DENIED_TOOLTIP : undefined
            }
            onClick={() => setCompleteOpen(true)}>
            {isCompletePermissionPending || completeLocked ? (
              <LockSimpleIcon />
            ) : null}
            Concluir atendimento
          </Button>
        ) : null}
      </header>

      <AlertDialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Concluir atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              O paciente seguirá para a recepção para efetuar o pagamento, se
              houver cobrança pendente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completeAttendance.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={completeAttendance.isPending}
              onClick={(event) => {
                event.preventDefault();
                completeAttendance.mutate({
                  id: appointment.id,
                  status: "completed",
                });
              }}>
              Concluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={afterCompleteOpen} onOpenChange={setAfterCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atendimento concluído</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja voltar à agenda ou permanecer neste atendimento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Permanecer no atendimento</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(agendaHref)}>
              Voltar à agenda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
