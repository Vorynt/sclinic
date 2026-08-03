"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/modules/appointments/components/AppointmentForm";
import type { AppointmentType } from "@/modules/appointments/types/appointment";

type LockedPatient = {
  id: string;
  name: string;
};

type AppointmentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartsAt?: Date;
  /** When set, patient is pre-selected and the combobox is disabled. */
  lockedPatient?: LockedPatient;
  defaultType?: AppointmentType;
  allowedTypes?: readonly AppointmentType[];
  defaultProfessionalId?: string | null;
  title?: string;
  description?: string;
};

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
    : "closed";

  const resolvedDescription =
    description ??
    (lockedPatient
      ? `Informe horário e cobrança para ${lockedPatient.name}.`
      : "Informe paciente, horário e cobrança.");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,720px)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton>
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border px-4 py-4 pr-12 text-left">
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
  );
}
