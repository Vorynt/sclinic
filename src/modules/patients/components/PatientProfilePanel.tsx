"use client"

import { useState } from "react"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Permission } from "@/config/permissions"
import { PatientCard } from "@/modules/patients/components/PatientCard"
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog"
import { usePatient } from "@/modules/patients/hooks/use-patient"
import { useAuth } from "@/providers/AuthProvider"

type PatientProfilePanelProps = {
  patientId: string
}

export function PatientProfilePanel({ patientId }: PatientProfilePanelProps) {
  const { can } = useAuth()
  const patientQuery = usePatient(patientId)
  const [editOpen, setEditOpen] = useState(false)
  const canWrite = can(Permission.PATIENTS_WRITE)

  if (patientQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (patientQuery.isError || !patientQuery.data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar o cadastro do paciente."
        onRetry={() => {
          void patientQuery.refetch()
        }}
        isRetrying={patientQuery.isFetching}
      />
    )
  }

  const patient = patientQuery.data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Cadastro
          </h2>
          <p className="text-sm text-muted-foreground">
            Dados demográficos, contato e observações administrativas.
          </p>
        </div>
        {canWrite ? (
          <Button
            type="button"
            variant="outline"
            className="w-fit shrink-0"
            onClick={() => setEditOpen(true)}
          >
            Editar cadastro
          </Button>
        ) : null}
      </div>

      <PatientCard patient={patient} />

      {canWrite ? (
        <PatientFormDialog
          patient={patient}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </div>
  )
}
