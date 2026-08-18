"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import { PatientAppointmentHistory } from "@/modules/appointments/components/PatientAppointmentHistory"
import { useAttendancePanel } from "@/modules/appointments/hooks/use-attendance-panel"
import type { Appointment } from "@/modules/appointments/types/appointment"
import { ClinicalNoteHistoryPanel } from "@/modules/medical-records/components/ClinicalNoteHistoryPanel"
import { PatientClinicalAlertsPanel } from "@/modules/medical-records/components/PatientClinicalAlertsPanel"
import { PrescriptionsPanel } from "@/modules/medical-records/components/PrescriptionsPanel"
import { VitalSignsPanel } from "@/modules/medical-records/components/VitalSignsPanel"
import { usePatientClinicalNotesQuery } from "@/modules/medical-records/hooks/use-clinical-notes"
import { PatientQuickCard } from "@/modules/patients/components/PatientQuickCard"

const FOLLOW_UP_TYPES = ["follow_up", "procedure"] as const

type AttendancePanelSheetsProps = {
  appointment: Appointment
}

export function AttendancePanelSheets({
  appointment,
}: AttendancePanelSheetsProps) {
  const { panel, setPanel } = useAttendancePanel()
  const notesQuery = usePatientClinicalNotesQuery(
    {
      patientId: appointment.patientId,
      excludeAppointmentId: appointment.id,
    },
    panel === "patient",
  )

  return (
    <>
      <Sheet
        open={panel === "vitals"}
        onOpenChange={(open) => {
          if (!open) setPanel(null)
        }}
      >
        <SheetContent
          side="right"
          className="h-full w-full gap-0 overflow-y-auto data-[side=right]:sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Sinais vitais</SheetTitle>
            <SheetDescription>
              Medições desta consulta e histórico do paciente.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {panel === "vitals" ? (
              <VitalSignsPanel appointmentId={appointment.id} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={panel === "documents"}
        onOpenChange={(open) => {
          if (!open) setPanel(null)
        }}
      >
        <SheetContent
          side="right"
          className="h-full w-full gap-0 overflow-y-auto data-[side=right]:sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Documentos</SheetTitle>
            <SheetDescription>
              Receitas, declarações, atestados e solicitações desta consulta.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {panel === "documents" ? (
              <PrescriptionsPanel appointmentId={appointment.id} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={panel === "patient"}
        onOpenChange={(open) => {
          if (!open) setPanel(null)
        }}
      >
        <SheetContent
          side="right"
          className="h-full w-full gap-0 overflow-y-auto data-[side=right]:sm:max-w-lg"
        >
          <SheetHeader>
            <SheetTitle>Contexto do paciente</SheetTitle>
            <SheetDescription>
              Ficha, alertas, anotações anteriores e histórico de consultas.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6 px-4 pb-6">
            {panel === "patient" ? (
              <>
                <PatientQuickCard patientId={appointment.patientId} />
                <PatientClinicalAlertsPanel patientId={appointment.patientId} />
                <ClinicalNoteHistoryPanel
                  notes={notesQuery.data}
                  isLoading={notesQuery.isLoading}
                  isError={notesQuery.isError}
                  onRetry={() => {
                    void notesQuery.refetch()
                  }}
                  isRetrying={notesQuery.isFetching}
                />
                <PatientAppointmentHistory
                  patientId={appointment.patientId}
                  excludeAppointmentId={appointment.id}
                />
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <AppointmentFormDialog
        open={panel === "next"}
        onOpenChange={(open) => {
          if (!open) setPanel(null)
        }}
        lockedPatient={{
          id: appointment.patientId,
          name: appointment.patientName,
        }}
        defaultType="follow_up"
        allowedTypes={FOLLOW_UP_TYPES}
        defaultProfessionalId={appointment.professionalId}
        title="Agendar retorno ou procedimento"
        description={`Paciente: ${appointment.patientName}. Escolha retorno ou procedimento, data e horário.`}
      />
    </>
  )
}
