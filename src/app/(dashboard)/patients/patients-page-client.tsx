"use client"

import { useState } from "react"

import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import { PatientsPanel } from "@/modules/patients/components/PatientsPanel"
import type { Patient } from "@/modules/patients/types/patient"

type SchedulingPatient = {
  id: string
  name: string
}

/**
 * Composes patients list + appointment create dialog at the app boundary
 * so patients ↔ appointments modules do not import each other's UI.
 */
export function PatientsPageClient() {
  const [schedulingPatient, setSchedulingPatient] =
    useState<SchedulingPatient | null>(null)

  function handleSchedulePatient(patient: Patient) {
    setSchedulingPatient({ id: patient.id, name: patient.name })
  }

  return (
    <>
      <PatientsPanel onSchedulePatient={handleSchedulePatient} />
      <AppointmentFormDialog
        open={Boolean(schedulingPatient)}
        onOpenChange={(open) => {
          if (!open) setSchedulingPatient(null)
        }}
        lockedPatient={schedulingPatient ?? undefined}
      />
    </>
  )
}
