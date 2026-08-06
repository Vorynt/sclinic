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
  /** `quick` shows only name, CPF and phone (fast reception intake). Default: `full`. */
  variant?: "full" | "quick"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (patient: Patient) => void
}

export function PatientFormDialog({
  patient,
  variant = "full",
  open,
  onOpenChange,
  onSuccess,
}: PatientFormDialogProps) {
  const isEditing = Boolean(patient)
  const isQuick = variant === "quick" && !isEditing

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
              : isQuick
                ? "Cadastro rápido — nome, CPF e telefone."
                : "Preencha os dados para cadastrar um novo paciente."}
          </DialogDescription>
        </DialogHeader>

        <PatientForm
          key={patient?.id ?? "create"}
          patient={patient}
          variant={isQuick ? "quick" : "full"}
          onSuccess={(updatedPatient) => {
            if (updatedPatient) {
              onSuccess?.(updatedPatient)
            }
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
