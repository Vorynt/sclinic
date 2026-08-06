"use client";

import { useState } from "react";
import { toast } from "sonner";

import { WeeklyHoursForm } from "@/modules/clinics/components/WeeklyHoursForm";
import {
  useApplyDefaultClinicHoursMutation,
  useUpsertClinicHoursMutation,
} from "@/modules/clinics/hooks/use-clinic-settings";
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type ClinicHoursFormProps = {
  initialDays: ClinicWeeklyHours;
  /** When true, shows “Configurar depois” (onboarding). */
  showSkipDefault?: boolean;
  submitLabel?: string;
  onSaved?: () => void;
  onSkipped?: () => void;
};

const CLINIC_HOURS_FORM_ID = "clinic-hours-form";

export function ClinicHoursForm({
  initialDays,
  showSkipDefault = false,
  submitLabel = "Salvar horários",
  onSaved,
  onSkipped,
}: ClinicHoursFormProps) {
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const upsertHours = useUpsertClinicHoursMutation({
    onSuccess: () => {
      toast.success("Horários salvos");
      onSaved?.();
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

  const applyDefault = useApplyDefaultClinicHoursMutation({
    onSuccess: () => {
      toast.success("Horário padrão aplicado (07:00–19:00)");
      onSkipped?.();
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

  return (
    <WeeklyHoursForm
      formId={CLINIC_HOURS_FORM_ID}
      initialDays={initialDays}
      submitLabel={submitLabel}
      isPending={upsertHours.isPending}
      showSkip={showSkipDefault}
      isSkipping={applyDefault.isPending}
      formError={formError}
      onSubmit={(data) => {
        setFormError(null);
        upsertHours.mutate(data);
      }}
      onSkip={() => {
        setFormError(null);
        applyDefault.mutate();
      }}
    />
  );
}
