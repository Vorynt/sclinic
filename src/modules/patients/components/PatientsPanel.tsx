"use client"

import { useState } from "react"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog"
import { PatientsTable } from "@/modules/patients/components/PatientsTable"
import type { Patient } from "@/modules/patients/types/patient"

type PatientsPanelProps = {
  onSchedulePatient?: (patient: Patient) => void
}

export function PatientsPanel({ onSchedulePatient }: PatientsPanelProps) {
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  function handleNewPatient() {
    setEditingPatient(null)
    setDialogOpen(true)
  }

  function handleEditPatient(patient: Patient) {
    setEditingPatient(patient)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pacientes"
        description="Cadastro e busca de pacientes da clínica."
        actions={
          <Button type="button" onClick={handleNewPatient}>
            Novo paciente
          </Button>
        }
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
