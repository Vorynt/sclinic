"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { WeeklyHoursForm } from "@/modules/clinics/components/WeeklyHoursForm";
import { buildOnboardingHoursDraft } from "@/modules/clinics/constants/default-hours";
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours";
import {
  useProfessionalHoursQuery,
  useUpsertProfessionalHoursMutation,
} from "@/modules/professionals/hooks/use-professional-hours";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type ProfessionalHoursDialogProps = {
  professionalId: string | null;
  professionalName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isUnconfiguredWeek(
  days: { isClosed: boolean; intervals: unknown[] }[],
): boolean {
  return days.every((day) => day.isClosed && day.intervals.length === 0);
}

export function ProfessionalHoursDialog({
  professionalId,
  professionalName,
  open,
  onOpenChange,
}: ProfessionalHoursDialogProps) {
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const hoursQuery = useProfessionalHoursQuery(
    professionalId ?? "",
    open && Boolean(professionalId),
  );

  const upsertMutation = useUpsertProfessionalHoursMutation({
    onSuccess: () => {
      toast.success("Horários do profissional salvos");
      onOpenChange(false);
    },
    onError: (error) => {
      if (isAppError(error)) {
        setFormError({ message: error.message, code: error.code });
        return;
      }
      setFormError({
        message: getClientMessage(ErrorCode.INTERNAL_ERROR),
        code: ErrorCode.INTERNAL_ERROR,
      });
    },
  });

  const initialDays = useMemo<ClinicWeeklyHours>(() => {
    if (!hoursQuery.data) return buildOnboardingHoursDraft();
    return isUnconfiguredWeek(hoursQuery.data)
      ? buildOnboardingHoursDraft()
      : hoursQuery.data;
  }, [hoursQuery.data]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setFormError(null);
        onOpenChange(nextOpen);
      }}>
      <DialogContent className="flex max-h-[min(90vh,800px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12 text-left sm:px-6">
          <DialogTitle>Horário do profissional</DialogTitle>
          <DialogDescription>
            {professionalName
              ? `Subconjunto do expediente da clínica para ${professionalName}. Sem configuração própria, herda o horário da clínica.`
              : "Subconjunto do expediente da clínica. Sem configuração própria, herda o horário da clínica."}
          </DialogDescription>
        </DialogHeader>

        {hoursQuery.isLoading ? (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
            <Spinner />
            Carregando…
          </div>
        ) : hoursQuery.isError ? (
          <p className="px-4 py-6 text-sm text-destructive sm:px-6">
            Não foi possível carregar os horários.
          </p>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <WeeklyHoursForm
              key={`${professionalId}-${hoursQuery.dataUpdatedAt}`}
              initialDays={initialDays}
              submitLabel="Salvar horários"
              closedDayMessage="O profissional não atende neste dia."
              description="Selecione um dia para editar. Use “Copiar este horário” para repetir o mesmo padrão em outros dias."
              isPending={upsertMutation.isPending}
              formError={formError}
              secondaryActions={
                <Button
                  type="button"
                  variant="outline"
                  disabled={upsertMutation.isPending}
                  onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
              }
              onSubmit={(data) => {
                if (!professionalId) return;
                setFormError(null);
                upsertMutation.mutate({
                  professionalId,
                  days: data.days,
                });
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
