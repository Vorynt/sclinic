"use client"

import { VitalSignsHistoryPanel } from "@/modules/medical-records/components/VitalSignsHistoryPanel"
import { usePatientVitalSignsQuery } from "@/modules/medical-records/hooks/use-vital-signs"

type PatientVitalSignsSectionProps = {
  patientId: string
}

/**
 * Read-only vital signs history for the patient detail workspace.
 * Editing remains scoped to an attendance context.
 */
export function PatientVitalSignsSection({
  patientId,
}: PatientVitalSignsSectionProps) {
  const vitalsQuery = usePatientVitalSignsQuery({ patientId })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Sinais vitais
        </h2>
        <p className="text-sm text-muted-foreground">
          Medições registradas nos atendimentos deste paciente.
        </p>
      </div>

      <VitalSignsHistoryPanel
        items={vitalsQuery.data}
        isLoading={vitalsQuery.isLoading}
        isError={vitalsQuery.isError}
        title="Histórico de medições"
        description="Pressão, peso, temperatura e demais sinais vitais."
        emptyMessage="Nenhuma medição registrada."
      />
    </div>
  )
}
