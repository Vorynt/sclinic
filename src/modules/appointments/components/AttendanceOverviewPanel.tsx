"use client"

import { format } from "date-fns"
import Link from "next/link"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { PatientAppointmentHistory } from "@/modules/appointments/components/PatientAppointmentHistory"
import { ScheduleNextAppointmentCard } from "@/modules/appointments/components/ScheduleNextAppointmentCard"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/modules/appointments/constants/appointments"
import { useAppointmentQuery } from "@/modules/appointments/hooks/use-appointment"
import { PatientQuickCard } from "@/modules/patients/components/PatientQuickCard"
import { PatientClinicalAlertsPanel } from "@/modules/medical-records/components/PatientClinicalAlertsPanel"

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
      <QueryErrorState
        description="Não foi possível carregar o resumo do atendimento."
        onRetry={() => {
          void appointmentQuery.refetch()
        }}
        isRetrying={appointmentQuery.isFetching}
      />
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
          Contexto do agendamento e do paciente. Use a navegação ao lado para
          abrir as seções clínicas.
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

      <PatientQuickCard patientId={appointment.patientId} />

      <PatientClinicalAlertsPanel patientId={appointment.patientId} />

      <PatientAppointmentHistory
        patientId={appointment.patientId}
        excludeAppointmentId={appointment.id}
      />

      <ScheduleNextAppointmentCard
        patientId={appointment.patientId}
        patientName={appointment.patientName}
        professionalId={appointment.professionalId}
      />

      <div className="flex flex-col gap-2 rounded-md border border-border px-4 py-4">
        <p className="text-sm font-medium text-foreground">Anotações clínicas</p>
        <p className="text-sm text-muted-foreground">
          Registre e visualize a evolução clínica deste paciente.
        </p>
        <Button asChild variant="outline" className="w-fit">
          <Link href={routes.appointmentAttendanceNotes(appointmentId)}>
            Abrir anotações
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-border px-4 py-4">
        <p className="text-sm font-medium text-foreground">Sinais vitais</p>
        <p className="text-sm text-muted-foreground">
          Pressão, peso, temperatura e histórico de medições anteriores.
        </p>
        <Button asChild variant="outline" className="w-fit">
          <Link href={routes.appointmentAttendanceVitals(appointmentId)}>
            Abrir sinais vitais
          </Link>
        </Button>
      </div>
    </div>
  )
}
