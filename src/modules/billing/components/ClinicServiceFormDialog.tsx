"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ClinicServiceForm } from "@/modules/billing/components/ClinicServiceForm"
import type { ClinicService } from "@/modules/billing/types/clinic-service"

type ClinicServiceFormDialogProps = {
  service?: ClinicService | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (service: ClinicService) => void
}

export function ClinicServiceFormDialog({
  service,
  open,
  onOpenChange,
  onSuccess,
}: ClinicServiceFormDialogProps) {
  const isEditing = Boolean(service)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar serviço" : "Novo serviço"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do serviço no catálogo."
              : "Cadastre um serviço com preço fixo para uso na agenda."}
          </DialogDescription>
        </DialogHeader>

        <ClinicServiceForm
          key={service?.id ?? "create"}
          service={service}
          onSuccess={(updatedService) => {
            onSuccess?.(updatedService)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
