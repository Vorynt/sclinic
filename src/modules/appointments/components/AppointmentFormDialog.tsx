"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppointmentForm } from "@/modules/appointments/components/AppointmentForm"
import type { AppointmentType } from "@/modules/appointments/types/appointment"

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
  defaultType?: AppointmentType
  allowedTypes?: readonly AppointmentType[]
  defaultProfessionalId?: string | null
  title?: string
  description?: string
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  defaultStartsAt,
  lockedPatient,
  defaultType,
  allowedTypes,
  defaultProfessionalId,
  title = "Novo agendamento",
  description,
}: AppointmentFormDialogProps) {
  const formKey = open
    ? [
        lockedPatient?.id ?? "free",
        defaultType ?? "consultation",
        defaultProfessionalId ?? "none",
        defaultStartsAt?.toISOString() ?? "create",
      ].join(":")
    : "closed"

  const resolvedDescription =
    description ??
    (lockedPatient
      ? `Agende uma consulta para ${lockedPatient.name}.`
      : "Preencha os dados para agendar uma consulta.")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{resolvedDescription}</DialogDescription>
        </DialogHeader>

        <AppointmentForm
          key={formKey}
          defaultStartsAt={defaultStartsAt}
          lockedPatient={lockedPatient}
          defaultType={defaultType}
          allowedTypes={allowedTypes}
          defaultProfessionalId={defaultProfessionalId}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
