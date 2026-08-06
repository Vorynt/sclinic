"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/modules/appointments/constants/appointments"
import { usePatientAppointmentsQuery } from "@/modules/appointments/hooks/use-appointments"

type PatientAppointmentHistoryProps = {
  patientId: string
  excludeAppointmentId?: string
  limit?: number
  title?: string
  description?: string
}

export function PatientAppointmentHistory({
  patientId,
  excludeAppointmentId,
  limit = 10,
  title = "Histórico de consultas",
  description = "Atendimentos anteriores deste paciente na clínica.",
}: PatientAppointmentHistoryProps) {
  const historyQuery = usePatientAppointmentsQuery({
    patientId,
    excludeAppointmentId,
    limit,
  })

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border px-4 py-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {historyQuery.isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : null}

      {historyQuery.isError ? (
        <QueryErrorState
          description="Não foi possível carregar o histórico de consultas."
          onRetry={() => {
            void historyQuery.refetch()
          }}
          isRetrying={historyQuery.isFetching}
        />
      ) : null}

      {!historyQuery.isLoading &&
      !historyQuery.isError &&
      historyQuery.data &&
      historyQuery.data.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
          Nenhuma consulta anterior.
        </p>
      ) : null}

      {!historyQuery.isLoading &&
      !historyQuery.isError &&
      historyQuery.data &&
      historyQuery.data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {historyQuery.data.map((appointment) => (
            <li
              key={appointment.id}
              className="flex flex-col gap-2 rounded-md border border-border px-3 py-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground">
                  {format(appointment.startsAt, "dd MMM yyyy · HH:mm", {
                    locale: ptBR,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {appointment.professionalName ?? "Sem profissional"}
                  {appointment.reason ? ` · ${appointment.reason}` : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">
                  {APPOINTMENT_TYPE_LABELS[appointment.type]}
                </Badge>
                <Badge variant="secondary">
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
