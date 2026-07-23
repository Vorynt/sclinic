"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PatientForm } from "@/modules/patients/components/PatientForm"
import type { Patient } from "@/modules/patients/types/patient"

type PatientFormDialogProps = {
  patient?: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientFormDialog({
  patient,
  open,
  onOpenChange,
}: PatientFormDialogProps) {
  const isEditing = Boolean(patient)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar paciente" : "Novo paciente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do paciente."
              : "Preencha os dados para cadastrar um novo paciente."}
          </DialogDescription>
        </DialogHeader>

        <PatientForm
          key={patient?.id ?? "create"}
          patient={patient}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
