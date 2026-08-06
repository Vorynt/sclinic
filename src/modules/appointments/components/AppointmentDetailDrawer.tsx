"use client";

import {
  ArrowsClockwiseIcon,
  CheckIcon,
  PencilSimpleIcon,
  StethoscopeIcon,
  UserMinusIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
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
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { AppointmentDetailsForm } from "@/modules/appointments/components/AppointmentDetailsForm";
import { AppointmentRescheduleForm } from "@/modules/appointments/components/AppointmentRescheduleForm";
import {
  APPOINTMENT_MODALITY_LABELS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  canConfirmAppointment,
  canMarkAppointmentNoShow,
  canResumeAttendance,
  canRoleStartAttendance,
  canStartAttendance,
  isAppointmentScheduleEditable,
} from "@/modules/appointments/constants/appointments";
import {
  useCancelAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from "@/modules/appointments/hooks/use-appointment-mutations";
import { useCalendarQueryParams } from "@/modules/appointments/hooks/use-calendar-query-params";
import type {
  Appointment,
  AppointmentStatus,
} from "@/modules/appointments/types/appointment";
import { buildAttendanceHref } from "@/modules/appointments/utils/agenda-href";
import { useAuthSession } from "@/modules/authentication/hooks/use-auth";
import { AppointmentChargeSummary } from "@/modules/billing/components/AppointmentChargeSummary";
import { PatientCompactSummary } from "@/modules/patients/components/PatientCompactSummary";
import { useAttendanceUiStore } from "@/stores/attendance.store";

type DrawerMode = "view" | "reschedule" | "edit-details";

type AppointmentDetailDrawerProps = {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentChange?: (appointment: Appointment) => void;
};

function statusBadgeVariant(
  status: AppointmentStatus,
): "secondary" | "outline" | "destructive" {
  if (status === "canceled" || status === "no_show") return "destructive";
  if (status === "completed") return "secondary";
  return "outline";
}

export function AppointmentDetailDrawer({
  appointment,
  open,
  onOpenChange,
  onAppointmentChange,
}: AppointmentDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 p-0">
        {appointment ? (
          // Keyed by id so local mode/cancel state resets when the
          // selected appointment changes, without needing an effect.
          <AppointmentDetailContent
            key={appointment.id}
            appointment={appointment}
            onOpenChange={onOpenChange}
            onAppointmentChange={onAppointmentChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

type AppointmentDetailContentProps = {
  appointment: Appointment;
  onOpenChange: (open: boolean) => void;
  onAppointmentChange?: (appointment: Appointment) => void;
};

function AppointmentDetailContent({
  appointment,
  onOpenChange,
  onAppointmentChange,
}: AppointmentDetailContentProps) {
  const router = useRouter();
  const { mode: agendaMode, date: agendaDate } = useCalendarQueryParams();
  const sessionQuery = useAuthSession();
  const beginPreparingAttendance = useAttendanceUiStore(
    (state) => state.beginPreparingAttendance,
  );
  const endPreparingAttendance = useAttendanceUiStore(
    (state) => state.endPreparingAttendance,
  );
  const [mode, setMode] = useState<DrawerMode>("view");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const canStartByRole = canRoleStartAttendance(
    sessionQuery.data?.membership?.roleKey,
  );

  const cancelAppointment = useCancelAppointmentMutation({
    onSuccess: () => {
      toast.success("Agendamento cancelado");
      setConfirmOpen(false);
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStatus = useUpdateAppointmentStatusMutation({
    onSuccess: (updated) => {
      if (updated.status === "checked_in") {
        onAppointmentChange?.(updated);
        router.push(
          buildAttendanceHref(updated.id, {
            mode: agendaMode,
            date: agendaDate,
          }),
        );
        return;
      }

      toast.success(
        updated.status === "confirmed"
          ? "Agendamento confirmado"
          : updated.status === "no_show"
            ? "Falta registrada"
            : "Status atualizado",
      );
      onAppointmentChange?.(updated);
    },
    onError: (error) => {
      endPreparingAttendance();
      toast.error(error.message);
    },
  });

  const isCanceled = appointment.status === "canceled";
  const canEditSchedule = isAppointmentScheduleEditable(appointment.status);
  const showConfirm = canConfirmAppointment(appointment.status);
  const showNoShow = canMarkAppointmentNoShow(appointment.status);
  const needsCheckIn = canStartAttendance(appointment.status);
  const showStartAttendance = needsCheckIn && canStartByRole;
  const showResumeOrView =
    canResumeAttendance(appointment.status) ||
    appointment.status === "completed";
  const showAttendance = showStartAttendance || showResumeOrView;
  const attendanceLabel = canResumeAttendance(appointment.status)
    ? "Abrir atendimento"
    : appointment.status === "completed"
      ? "Ver atendimento"
      : "Iniciar atendimento";
  const showActionGroup = showConfirm || showNoShow || canEditSchedule;
  const isStatusPending = updateStatus.isPending;

  function openAttendanceWorkspace() {
    beginPreparingAttendance();
    router.push(
      buildAttendanceHref(appointment.id, {
        mode: agendaMode,
        date: agendaDate,
      }),
    );
  }

  function handleAttendanceClick() {
    if (needsCheckIn) {
      beginPreparingAttendance();
      updateStatus.mutate({
        id: appointment.id,
        status: "checked_in",
      });
      return;
    }
    openAttendanceWorkspace();
  }

  if (mode === "reschedule") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <SheetHeader className="shrink-0 border-b">
          <SheetTitle>Remarcar agendamento</SheetTitle>
          <SheetDescription>
            {appointment.patientName} · altere profissional, data ou horário.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <AppointmentRescheduleForm
            appointment={appointment}
            onCancel={() => setMode("view")}
            onSuccess={(updated) => {
              onAppointmentChange?.(updated);
              setMode("view");
            }}
          />
        </div>
      </div>
    );
  }

  if (mode === "edit-details") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <SheetHeader className="shrink-0 border-b">
          <SheetTitle>Editar detalhes</SheetTitle>
          <SheetDescription>
            {appointment.patientName} · tipo, motivo e observações.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <AppointmentDetailsForm
            appointment={appointment}
            onCancel={() => setMode("view")}
            onSuccess={(updated) => {
              onAppointmentChange?.(updated);
              setMode("view");
            }}
          />
        </div>
      </div>
    );
  }

  const hasSecondaryDetails = Boolean(
    appointment.reason ||
    appointment.notes ||
    (isCanceled && appointment.canceledReason),
  );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="sticky top-0 z-10 shrink-0 border-b bg-popover px-4 pb-4 pt-4 pr-12">
          <SheetHeader className="gap-1 p-0">
            <SheetTitle>{appointment.patientName}</SheetTitle>
            <SheetDescription>
              {format(appointment.startsAt, "EEEE, dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusBadgeVariant(appointment.status)}>
                {APPOINTMENT_STATUS_LABELS[appointment.status]}
              </Badge>
              <Badge variant="outline">
                {APPOINTMENT_TYPE_LABELS[appointment.type]}
              </Badge>
              <Badge variant="outline">
                {APPOINTMENT_MODALITY_LABELS[appointment.modality]}
              </Badge>
            </div>

            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Profissional</dt>
                <dd className="wrap-anywhere font-medium text-foreground">
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

            <div className="flex gap-2">
              {showAttendance ? (
                <Button
                  type="button"
                  disabled={isStatusPending}
                  onClick={handleAttendanceClick}>
                  {isStatusPending &&
                  updateStatus.variables?.status === "checked_in" ? (
                    <Spinner />
                  ) : (
                    <StethoscopeIcon />
                  )}
                  {attendanceLabel}
                </Button>
              ) : null}

              {showActionGroup ? (
                <ButtonGroup>
                  {showConfirm ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      tooltip="Confirmar"
                      disabled={isStatusPending}
                      onClick={() =>
                        updateStatus.mutate({
                          id: appointment.id,
                          status: "confirmed",
                        })
                      }>
                      {isStatusPending &&
                      updateStatus.variables?.status === "confirmed" ? (
                        <Spinner />
                      ) : (
                        <CheckIcon />
                      )}
                      <span className="sr-only">Confirmar</span>
                    </Button>
                  ) : null}

                  {showNoShow ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      tooltip="Marcar falta"
                      disabled={isStatusPending}
                      onClick={() =>
                        updateStatus.mutate({
                          id: appointment.id,
                          status: "no_show",
                        })
                      }>
                      {isStatusPending &&
                      updateStatus.variables?.status === "no_show" ? (
                        <Spinner />
                      ) : (
                        <UserMinusIcon />
                      )}
                      <span className="sr-only">Marcar falta</span>
                    </Button>
                  ) : null}

                  {canEditSchedule ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        tooltip="Remarcar"
                        disabled={isStatusPending}
                        onClick={() => setMode("reschedule")}>
                        <ArrowsClockwiseIcon />
                        <span className="sr-only">Remarcar</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        tooltip="Editar detalhes"
                        disabled={isStatusPending}
                        onClick={() => setMode("edit-details")}>
                        <PencilSimpleIcon />
                        <span className="sr-only">Editar detalhes</span>
                      </Button>
                    </>
                  ) : null}

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    tooltip="Cancelar agendamento"
                    disabled={isStatusPending}
                    onClick={() => setConfirmOpen(true)}>
                    <XCircleIcon />
                    <span className="sr-only">Cancelar agendamento</span>
                  </Button>
                </ButtonGroup>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <PatientCompactSummary patientId={appointment.patientId} />

            <AppointmentChargeSummary appointmentId={appointment.id} />

            {hasSecondaryDetails ? (
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

                {isCanceled && appointment.canceledReason ? (
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o agendamento de{" "}
              <strong>{appointment.patientName}</strong>? Essa ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            aria-label="Motivo do cancelamento"
            placeholder="Motivo do cancelamento (opcional)"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            disabled={cancelAppointment.isPending}
          />

          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelAppointment.isPending}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelAppointment.isPending}
              onClick={() =>
                cancelAppointment.mutate({
                  id: appointment.id,
                  canceledReason: cancelReason.trim() || undefined,
                })
              }>
              {cancelAppointment.isPending ? <Spinner /> : null}
              Cancelar agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
