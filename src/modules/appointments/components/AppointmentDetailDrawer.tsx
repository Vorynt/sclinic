"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/modules/appointments/constants/appointments"
import { useCancelAppointmentMutation } from "@/modules/appointments/hooks/use-appointment-mutations"
import type {
  Appointment,
  AppointmentStatus,
} from "@/modules/appointments/types/appointment"

type AppointmentDetailDrawerProps = {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function statusBadgeVariant(
  status: AppointmentStatus,
): "secondary" | "outline" | "destructive" {
  if (status === "canceled" || status === "no_show") return "destructive"
  if (status === "completed") return "secondary"
  return "outline"
}

export function AppointmentDetailDrawer({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {appointment ? (
          // Keyed by id so local cancel-confirmation state resets when the
          // selected appointment changes, without needing an effect.
          <AppointmentDetailContent
            key={appointment.id}
            appointment={appointment}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

type AppointmentDetailContentProps = {
  appointment: Appointment
  onOpenChange: (open: boolean) => void
}

function AppointmentDetailContent({
  appointment,
  onOpenChange,
}: AppointmentDetailContentProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  const cancelAppointment = useCancelAppointmentMutation({
    onSuccess: () => {
      toast.success("Agendamento cancelado")
      setConfirmOpen(false)
      onOpenChange(false)
    },
    onError: (error) => toast.error(error.message),
  })

  const isCanceled = appointment.status === "canceled"

  return (
    <>
      <SheetHeader>
        <SheetTitle>Detalhes do agendamento</SheetTitle>
        <SheetDescription>
          {format(appointment.startsAt, "EEEE, dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-4 overflow-y-auto px-4">
        <div className="flex items-center gap-2">
          <Badge variant={statusBadgeVariant(appointment.status)}>
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </Badge>
          <Badge variant="outline">
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
          </Badge>
        </div>

        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Paciente</dt>
            <dd className="font-medium text-foreground">
              {appointment.patientName}
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Profissional</dt>
            <dd className="font-medium text-foreground">
              {appointment.professionalName ?? "Não atribuído"}
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Data e horário</dt>
            <dd className="font-medium text-foreground">
              {format(appointment.startsAt, "dd/MM/yyyy")} ·{" "}
              {format(appointment.startsAt, "HH:mm")}–
              {format(appointment.endsAt, "HH:mm")}
            </dd>
          </div>

          {appointment.reason ? (
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Motivo</dt>
              <dd className="text-foreground">{appointment.reason}</dd>
            </div>
          ) : null}

          {appointment.notes ? (
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Observações</dt>
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
      </div>

      {!isCanceled ? (
        <SheetFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            Cancelar agendamento
          </Button>
        </SheetFooter>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o agendamento de{" "}
              <strong>{appointment.patientName}</strong>? Essa ação não pode
              ser desfeita.
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
              }
            >
              {cancelAppointment.isPending ? <Spinner /> : null}
              Cancelar agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
