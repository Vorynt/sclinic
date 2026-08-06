"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { QueryErrorState } from "@/components/status/QueryErrorState";
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
  /**
   * `self` — o profissional edita a própria grade.
   * `manage` — gestor ajusta em nome de alguém (override).
   */
  accessMode?: "self" | "manage";
};

function isUnconfiguredWeek(
  days: { isClosed: boolean; intervals: unknown[] }[],
): boolean {
  return days.every((day) => day.isClosed && day.intervals.length === 0);
}

function dialogCopy(params: {
  accessMode: "self" | "manage";
  professionalName?: string | null;
}): { title: string; description: string } {
  const { accessMode, professionalName } = params;

  if (accessMode === "manage") {
    return {
      title: professionalName
        ? `Horários de ${professionalName}`
        : "Horários de atendimento",
      description: professionalName
        ? `Ajuste quando ${professionalName} pode receber pacientes. A recepção vê só os horários livres na agenda.`
        : "Ajuste quando este profissional pode receber pacientes. A recepção vê só os horários livres na agenda.",
    };
  }

  return {
    title: "Meus horários",
    description:
      "Defina quando você pode receber pacientes. Se não configurar, valem os mesmos horários da clínica.",
  };
}

export function ProfessionalHoursDialog({
  professionalId,
  professionalName,
  open,
  onOpenChange,
  accessMode = "self",
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
      toast.success("Horários salvos");
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

  const copy = dialogCopy({ accessMode, professionalName });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setFormError(null);
        onOpenChange(nextOpen);
      }}>
      <DialogContent className="flex max-h-[min(90vh,800px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12 text-left sm:px-6">
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        {hoursQuery.isLoading ? (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
            <Spinner />
            Carregando horários…
          </div>
        ) : hoursQuery.isError ? (
          <QueryErrorState
            className="mx-4 my-6 sm:mx-6"
            description="Não foi possível carregar os horários. Tente novamente."
            onRetry={() => {
              void hoursQuery.refetch();
            }}
            isRetrying={hoursQuery.isFetching}
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <WeeklyHoursForm
              key={`${professionalId}-${hoursQuery.dataUpdatedAt}`}
              initialDays={initialDays}
              submitLabel="Salvar"
              closedDayMessage="Não atende neste dia."
              description="Escolha um dia para editar. Se houver pausa no almoço, adicione-a aqui — e, se quiser, copie o horário para outros dias."
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
