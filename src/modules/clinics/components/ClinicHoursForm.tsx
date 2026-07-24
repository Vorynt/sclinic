"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { Spinner } from "@/components/ui/spinner";
import { ClinicHoursDayRow } from "@/modules/clinics/components/ClinicHoursDayRow";
import {
  useApplyDefaultClinicHoursMutation,
  useUpsertClinicHoursMutation,
} from "@/modules/clinics/hooks/use-clinic-settings";
import { clinicWeeklyHoursSchema } from "@/modules/clinics/schemas/clinic-hours.schema";
import {
  DAY_OF_WEEK_DISPLAY_ORDER,
  type ClinicTimeInterval,
  type ClinicWeeklyHours,
} from "@/modules/clinics/types/clinic-hours";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type HoursFormValues = z.input<typeof clinicWeeklyHoursSchema>;
type HoursFormOutput = z.output<typeof clinicWeeklyHoursSchema>;

type ClinicHoursFormProps = {
  initialDays: ClinicWeeklyHours;
  /** When true, shows “Configurar depois” (onboarding). */
  showSkipDefault?: boolean;
  submitLabel?: string;
  onSaved?: () => void;
  onSkipped?: () => void;
};

function sortDaysForForm(days: ClinicWeeklyHours): ClinicWeeklyHours {
  const byDow = new Map(days.map((day) => [day.dayOfWeek, day]));
  return DAY_OF_WEEK_DISPLAY_ORDER.map(
    (dow) =>
      byDow.get(dow) ?? {
        dayOfWeek: dow,
        isClosed: true,
        intervals: [],
      },
  );
}

const DEFAULT_OPEN_INTERVAL: ClinicTimeInterval = {
  opensAt: "08:00",
  closesAt: "18:00",
};

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

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<HoursFormValues, unknown, HoursFormOutput>({
    resolver: zodResolver(clinicWeeklyHoursSchema),
    defaultValues: {
      days: sortDaysForForm(initialDays),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "days",
  });

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

  const isPending = upsertHours.isPending || applyDefault.isPending;
  const days = watch("days");

  const onSubmit = handleSubmit((data) => {
    setFormError(null);
    upsertHours.mutate(data);
  });

  function setDayOpen(index: number, open: boolean) {
    setValue(`days.${index}.isClosed`, !open, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!open) {
      setValue(`days.${index}.intervals`, [], {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const current = getValues(`days.${index}.intervals`);
    if (!current || current.length === 0) {
      setValue(`days.${index}.intervals`, [{ ...DEFAULT_OPEN_INTERVAL }], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function setDayIntervals(index: number, intervals: ClinicTimeInterval[]) {
    setValue(`days.${index}.intervals`, intervals, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function applyMondayToWeekdays(sourceIndex: number) {
    const source = getValues(`days.${sourceIndex}`);
    if (!source || source.isClosed) return;

    const clonedIntervals = source.intervals.map((interval) => ({
      ...interval,
    }));

    const currentDays = getValues("days");
    currentDays.forEach((day, index) => {
      if (day.dayOfWeek < 1 || day.dayOfWeek > 5) return;

      setValue(
        `days.${index}`,
        {
          dayOfWeek: day.dayOfWeek,
          isClosed: false,
          intervals: clonedIntervals.map((interval) => ({ ...interval })),
        },
        { shouldDirty: true, shouldValidate: true },
      );
    });

    toast.success("Horário aplicado de segunda a sexta");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <p className="text-sm text-muted-foreground">
        Defina quando a clínica atende. Toque em Pausa se houver intervalo de
        almoço.
      </p>

      <div className="divide-y divide-border rounded-lg border border-border">
        {fields.map((field, index) => {
          const dayOfWeek = days?.[index]?.dayOfWeek ?? field.dayOfWeek;
          const isClosed = days?.[index]?.isClosed ?? true;
          const intervals = days?.[index]?.intervals ?? [];
          const isMonday = dayOfWeek === 1;

          return (
            <ClinicHoursDayRow
              key={field.id}
              index={index}
              dayOfWeek={dayOfWeek}
              isClosed={isClosed}
              intervals={intervals}
              disabled={isPending}
              errors={errors.days}
              register={register}
              onToggleOpen={(open) => setDayOpen(index, open)}
              onIntervalsChange={(next) => setDayIntervals(index, next)}
              onApplyToWeekdays={
                isMonday && !isClosed
                  ? () => applyMondayToWeekdays(index)
                  : undefined
              }
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {showSkipDefault ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => {
              setFormError(null);
              applyDefault.mutate();
            }}>
            {applyDefault.isPending ? (
              <>
                <Spinner />
                Aplicando…
              </>
            ) : (
              "Configurar depois"
            )}
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {upsertHours.isPending ? (
            <>
              <Spinner />
              Salvando…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
