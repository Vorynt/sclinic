"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog"
import { PatientsTable } from "@/modules/patients/components/PatientsTable"
import type { Patient } from "@/modules/patients/types/patient"

type PatientsPanelProps = {
  onSchedulePatient?: (patient: Patient) => void
}

export function PatientsPanel({ onSchedulePatient }: PatientsPanelProps) {
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(timeout)
  }, [q])

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Pacientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastro e busca de pacientes da clínica.
          </p>
        </div>
        <Button type="button" onClick={handleNewPatient}>
          Novo paciente
        </Button>
      </div>

      <Input
        placeholder="Buscar por nome ou CPF"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        className="max-w-sm"
      />

      <PatientsTable
        searchQuery={debouncedQ}
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
