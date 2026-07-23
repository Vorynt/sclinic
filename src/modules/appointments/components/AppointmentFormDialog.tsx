"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppointmentForm } from "@/modules/appointments/components/AppointmentForm"

type AppointmentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStartsAt?: Date
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  defaultStartsAt,
}: AppointmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para agendar uma consulta.
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          key={open ? (defaultStartsAt?.toISOString() ?? "create") : "closed"}
          defaultStartsAt={defaultStartsAt}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
