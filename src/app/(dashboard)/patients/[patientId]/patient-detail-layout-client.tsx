"use client"

import { useState, type ReactNode } from "react"

import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import { PatientDetailWorkspace } from "@/modules/patients/components/PatientDetailWorkspace"
import { usePatient } from "@/modules/patients/hooks/use-patient"

type PatientDetailLayoutClientProps = {
  patientId: string
  children: ReactNode
}

/**
 * App-boundary composition: patient workspace + schedule dialog
 * so patients ↔ appointments do not own each other's create UI.
 */
export function PatientDetailLayoutClient({
  patientId,
  children,
}: PatientDetailLayoutClientProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const patientQuery = usePatient(patientId)
  const patientName = patientQuery.data?.name

  return (
    <>
      <PatientDetailWorkspace
        patientId={patientId}
        onSchedule={
          patientName ? () => setScheduleOpen(true) : undefined
        }
      >
        {children}
      </PatientDetailWorkspace>

      {patientName ? (
        <AppointmentFormDialog
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          lockedPatient={{ id: patientId, name: patientName }}
        />
      ) : null}
    </>
  )
}
