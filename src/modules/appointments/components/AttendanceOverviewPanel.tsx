"use client"

import { format } from "date-fns"

import { Spinner } from "@/components/ui/spinner"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/modules/appointments/constants/appointments"
import { useAppointmentQuery } from "@/modules/appointments/hooks/use-appointment"

type AttendanceOverviewPanelProps = {
  appointmentId: string
}

export function AttendanceOverviewPanel({
  appointmentId,
}: AttendanceOverviewPanelProps) {
  const appointmentQuery = useAppointmentQuery(appointmentId)

  if (appointmentQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (appointmentQuery.isError || !appointmentQuery.data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar o resumo do atendimento.
      </p>
    )
  }

  const appointment = appointmentQuery.data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Resumo
        </h2>
        <p className="text-sm text-muted-foreground">
          Contexto do agendamento. Novos módulos clínicos aparecem na navegação
          ao lado.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Paciente</dt>
          <dd className="text-sm font-medium text-foreground">
            {appointment.patientName}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Profissional</dt>
          <dd className="text-sm font-medium text-foreground">
            {appointment.professionalName ?? "Não atribuído"}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Tipo</dt>
          <dd className="text-sm font-medium text-foreground">
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Status</dt>
          <dd className="text-sm font-medium text-foreground">
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Horário</dt>
          <dd className="text-sm font-medium text-foreground">
            {format(appointment.startsAt, "dd/MM/yyyy")} ·{" "}
            {format(appointment.startsAt, "HH:mm")}–
            {format(appointment.endsAt, "HH:mm")}
          </dd>
        </div>
      </dl>

      {appointment.reason ? (
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs text-muted-foreground">Motivo</h3>
          <p className="text-sm text-foreground">{appointment.reason}</p>
        </div>
      ) : null}

      {appointment.notes ? (
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs text-muted-foreground">Observações</h3>
          <p className="text-sm text-foreground">{appointment.notes}</p>
        </div>
      ) : null}

      <div className="rounded-md border border-dashed border-border px-4 py-6">
        <p className="text-sm font-medium text-foreground">
          Espaço para módulos clínicos
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Anotações, documentos e prontuário entram como seções nesta área,
          sem alterar o cabeçalho nem a navegação lateral.
        </p>
      </div>
    </div>
  )
}
