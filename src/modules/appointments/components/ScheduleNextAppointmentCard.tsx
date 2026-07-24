"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import type { AppointmentType } from "@/modules/appointments/types/appointment"

const FOLLOW_UP_TYPES = [
  "follow_up",
  "procedure",
] as const satisfies readonly AppointmentType[]

type ScheduleNextAppointmentCardProps = {
  patientId: string
  patientName: string
  /** Prefer keeping the same professional from the current attendance. */
  professionalId?: string | null
}

/**
 * Attendance overview card: schedule a follow-up or procedure for the
 * same patient without leaving the clinical workspace.
 */
export function ScheduleNextAppointmentCard({
  patientId,
  patientName,
  professionalId,
}: ScheduleNextAppointmentCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-2 rounded-md border border-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            Agendar retorno ou procedimento
          </p>
          <p className="text-sm text-muted-foreground">
            Marque o próximo atendimento deste paciente sem sair da tela.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-fit shrink-0"
          onClick={() => setOpen(true)}
        >
          Agendar
        </Button>
      </div>

      <AppointmentFormDialog
        open={open}
        onOpenChange={setOpen}
        lockedPatient={{ id: patientId, name: patientName }}
        defaultType="follow_up"
        allowedTypes={FOLLOW_UP_TYPES}
        defaultProfessionalId={professionalId}
        title="Agendar retorno ou procedimento"
        description={`Paciente: ${patientName}. Escolha retorno ou procedimento, data e horário.`}
      />
    </>
  )
}
