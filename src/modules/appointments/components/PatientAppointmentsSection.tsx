"use client"

import { PatientAppointmentHistory } from "@/modules/appointments/components/PatientAppointmentHistory"

type PatientAppointmentsSectionProps = {
  patientId: string
}

export function PatientAppointmentsSection({
  patientId,
}: PatientAppointmentsSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Agendamentos
        </h2>
        <p className="text-sm text-muted-foreground">
          Histórico de atendimentos deste paciente na clínica.
        </p>
      </div>

      <PatientAppointmentHistory
        patientId={patientId}
        limit={25}
        title="Histórico de consultas"
        description="Todos os agendamentos deste paciente na clínica."
      />
    </div>
  )
}
