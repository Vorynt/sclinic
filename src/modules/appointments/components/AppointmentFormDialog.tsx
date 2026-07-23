"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppointmentForm } from "@/modules/appointments/components/AppointmentForm"

type LockedPatient = {
  id: string
  name: string
}

type AppointmentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStartsAt?: Date
  /** When set, patient is pre-selected and the combobox is disabled. */
  lockedPatient?: LockedPatient
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  defaultStartsAt,
  lockedPatient,
}: AppointmentFormDialogProps) {
  const formKey = open
    ? [
        lockedPatient?.id ?? "free",
        defaultStartsAt?.toISOString() ?? "create",
      ].join(":")
    : "closed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
          <DialogDescription>
            {lockedPatient
              ? `Agende uma consulta para ${lockedPatient.name}.`
              : "Preencha os dados para agendar uma consulta."}
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          key={formKey}
          defaultStartsAt={defaultStartsAt}
          lockedPatient={lockedPatient}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
