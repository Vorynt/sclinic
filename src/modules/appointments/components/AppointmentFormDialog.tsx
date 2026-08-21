"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/modules/appointments/components/AppointmentForm";
import type { AppointmentType } from "@/modules/appointments/types/appointment";
import {
  buildAppointmentNewHref,
  type AppointmentNewHrefParams,
} from "@/modules/appointments/utils/appointment-new-href";

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
  /** When set, submitting promotes this waitlist entry instead of creating a plain appointment. */
  waitlistId?: string;
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
  waitlistId,
  title,
  description,
}: AppointmentFormDialogProps) {
  const router = useRouter();
  const resolvedTitle =
    title ?? (waitlistId ? "Promover da lista de espera" : "Novo agendamento");
  const formKey = open
    ? [
        lockedPatient?.id ?? "free",
        defaultType ?? "consultation",
        defaultProfessionalId ?? "none",
        defaultStartsAt?.toISOString() ?? "create",
        waitlistId ?? "none",
      ].join(":")
    : "closed";

  const resolvedDescription =
    description ??
    (waitlistId
      ? `Promova ${lockedPatient?.name ?? "o paciente"} da lista de espera para um agendamento.`
      : lockedPatient
        ? `Informe horário, tipo e serviço para ${lockedPatient.name}.`
        : "Informe paciente, horário, tipo e serviço. Use Mais opções para motivo e cobrança.");

  function handleAdvanced(draft: AppointmentNewHrefParams) {
    onOpenChange(false);
    router.push(buildAppointmentNewHref(draft));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,40rem)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border px-4 py-4 pr-12 text-left">
          <DialogTitle>{resolvedTitle}</DialogTitle>
          <DialogDescription>{resolvedDescription}</DialogDescription>
        </DialogHeader>
        <AppointmentForm
          key={formKey}
          variant="quick"
          layout="dialog"
          defaultStartsAt={defaultStartsAt}
          lockedPatient={lockedPatient}
          defaultType={defaultType}
          allowedTypes={allowedTypes}
          defaultProfessionalId={defaultProfessionalId}
          waitlistId={waitlistId}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          onAdvanced={handleAdvanced}
        />
      </DialogContent>
    </Dialog>
  );
}
