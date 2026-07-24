"use client"

import { ClinicalNoteHistoryPanel } from "@/modules/medical-records/components/ClinicalNoteHistoryPanel"
import { usePatientClinicalNotesQuery } from "@/modules/medical-records/hooks/use-clinical-notes"

type PatientClinicalNotesSectionProps = {
  patientId: string
}

/**
 * Read-only clinical notes history for the patient detail workspace.
 * Editing remains scoped to an attendance context.
 */
export function PatientClinicalNotesSection({
  patientId,
}: PatientClinicalNotesSectionProps) {
  const notesQuery = usePatientClinicalNotesQuery({ patientId })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Anotações
        </h2>
        <p className="text-sm text-muted-foreground">
          Histórico de evolução clínica registrado nos atendimentos deste
          paciente.
        </p>
      </div>

      <ClinicalNoteHistoryPanel
        notes={notesQuery.data}
        isLoading={notesQuery.isLoading}
        isError={notesQuery.isError}
        title="Histórico clínico"
        description="Todas as anotações vinculadas aos atendimentos do paciente."
        emptyMessage="Nenhuma anotação registrada."
      />
    </div>
  )
}
