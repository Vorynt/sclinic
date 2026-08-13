"use client"

import { PlusIcon } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import { PageHeader } from "@/components/layout/PageHeader"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog"
import { PatientsTable } from "@/modules/patients/components/PatientsTable"
import type { Patient } from "@/modules/patients/types/patient"
import type { PageAction } from "@/types/page-action"

type PatientsPanelProps = {
  onSchedulePatient?: (patient: Patient) => void
}

export function PatientsPanel({ onSchedulePatient }: PatientsPanelProps) {
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  function handleEditPatient(patient: Patient) {
    setEditingPatient(patient)
    setDialogOpen(true)
  }

  const pageActions = useMemo<PageAction[]>(
    () => [
      {
        id: "new-patient",
        label: "Novo paciente",
        icon: PlusIcon,
        onClick: () => {
          setEditingPatient(null)
          setDialogOpen(true)
        },
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pacientes"
        description="Cadastro e busca de pacientes da clínica."
        actions={pageActions}
      />

      <DataTableSearch
        value={q ?? ""}
        onValueChange={setQ}
        placeholder="Buscar por nome ou CPF"
      />

      <PatientsTable
        filters={{ q, page, pageSize }}
        onPageChange={setPage}
        onEdit={handleEditPatient}
        onSchedule={onSchedulePatient}
      />

      <PatientFormDialog
        patient={editingPatient}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingPatient(null)
        }}
      />
    </div>
  )
}
