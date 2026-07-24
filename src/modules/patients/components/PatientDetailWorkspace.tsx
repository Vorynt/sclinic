"use client"

import type { ReactNode } from "react"

import { Spinner } from "@/components/ui/spinner"
import { PatientDetailHeader } from "@/modules/patients/components/PatientDetailHeader"
import { PatientDetailNav } from "@/modules/patients/components/PatientDetailNav"
import { usePatient } from "@/modules/patients/hooks/use-patient"

type PatientDetailWorkspaceProps = {
  patientId: string
  children: ReactNode
  onSchedule?: () => void
}

/**
 * Patient detail workspace: patient context + section nav + module slot.
 * Lives under `(dashboard)` with AppShell. New modules plug in via
 * patient-detail-nav + nested routes.
 */
export function PatientDetailWorkspace({
  patientId,
  children,
  onSchedule,
}: PatientDetailWorkspaceProps) {
  const patientQuery = usePatient(patientId)

  if (patientQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (patientQuery.isError || !patientQuery.data) {
    return (
      <div className="flex flex-col gap-2 py-8">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Paciente
        </h1>
        <p className="text-sm text-destructive">
          Não foi possível carregar o paciente.
        </p>
      </div>
    )
  }

  const patient = patientQuery.data

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <PatientDetailHeader patient={patient} onSchedule={onSchedule} />

      <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="min-w-0">
          <PatientDetailNav patientId={patientId} />
        </aside>
        <div className="min-w-0 pb-8">{children}</div>
      </div>
    </div>
  )
}
