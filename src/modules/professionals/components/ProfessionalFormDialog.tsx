"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProfessionalForm } from "@/modules/professionals/components/ProfessionalForm"
import type { ProfessionalListItem } from "@/modules/professionals/types/professional"

type ProfessionalFormDialogProps = {
  professional?: ProfessionalListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfessionalFormDialog({
  professional,
  open,
  onOpenChange,
}: ProfessionalFormDialogProps) {
  const isEditing = Boolean(professional)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar profissional" : "Novo profissional"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do profissional."
              : "Informe nome, e-mail e papel. A pessoa receberá um link para criar a própria senha e aceitar o convite."}
          </DialogDescription>
        </DialogHeader>

        <ProfessionalForm
          key={professional?.id ?? "create"}
          professional={professional}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
