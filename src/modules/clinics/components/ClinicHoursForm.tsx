"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormErrorAlert, scrollFormToTop } from "@/components/ui/form-error-alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ClinicHoursDayRow } from "@/modules/clinics/components/ClinicHoursDayRow";
import {
  useApplyDefaultClinicHoursMutation,
  useUpsertClinicHoursMutation,
} from "@/modules/clinics/hooks/use-clinic-settings";
import { clinicWeeklyHoursSchema } from "@/modules/clinics/schemas/clinic-hours.schema";
import {
  DAY_OF_WEEK_DISPLAY_ORDER,
  DAY_OF_WEEK_LABELS_PT,
  DAY_OF_WEEK_SHORT_PT,
  type ClinicTimeInterval,
  type ClinicWeeklyHours,
} from "@/modules/clinics/types/clinic-hours";
import { formatDayHoursSummary } from "@/modules/clinics/utils/format-day-hours-summary";
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

const CLINIC_HOURS_FORM_ID = "clinic-hours-form";

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
  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<HoursFormValues, unknown, HoursFormOutput>({
    resolver: zodResolver(clinicWeeklyHoursSchema),
    defaultValues: {
      days: sortDaysForForm(initialDays),
    },
    shouldUnregister: false,
    // After the first failed submit, revalidate on change so refine/superRefine
    // errors (which live on sibling paths) clear as soon as the user fixes them.
    reValidateMode: "onChange",
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

  const daysWithErrors = fields
    .map((field, index) => {
      const dayOfWeek = days?.[index]?.dayOfWeek ?? field.dayOfWeek;
      if (!errors.days?.[index]) return null;
      return {
        index,
        dayOfWeek,
        label: DAY_OF_WEEK_LABELS_PT[dayOfWeek] ?? `Dia ${dayOfWeek}`,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const otherDaysWithErrors = daysWithErrors.filter(
    (entry) => entry.index !== selectedIndex,
  );

  const onSubmit = handleSubmit(
    (data) => {
      setFormError(null);
      upsertHours.mutate(data);
    },
    (validationErrors) => {
      const firstErrorIndex = fields.findIndex((_, index) =>
        Boolean(validationErrors.days?.[index]),
      );
      if (firstErrorIndex >= 0) {
        setSelectedIndex(firstErrorIndex);
      }
      scrollFormToTop(document.getElementById(CLINIC_HOURS_FORM_ID));
    },
  );

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

  function cloneIntervalsFrom(sourceIndex: number): ClinicTimeInterval[] {
    const source = getValues(`days.${sourceIndex}`);
    return (source?.intervals ?? []).map((interval) => ({ ...interval }));
  }

  function applyHoursToDays(
    sourceIndex: number,
    targetIndexes: number[],
    successMessage: string,
  ) {
    const source = getValues(`days.${sourceIndex}`);
    if (!source || source.isClosed) return;

    const clonedIntervals = cloneIntervalsFrom(sourceIndex);

    for (const index of targetIndexes) {
      const day = getValues(`days.${index}`);
      if (!day) continue;

      setValue(
        `days.${index}`,
        {
          dayOfWeek: day.dayOfWeek,
          isClosed: false,
          intervals: clonedIntervals.map((interval) => ({ ...interval })),
        },
        { shouldDirty: true, shouldValidate: true },
      );
    }

    toast.success(successMessage);
  }

  function applyToWeekdays(sourceIndex: number) {
    const currentDays = getValues("days");
    const targets = currentDays
      .map((day, index) => ({ day, index }))
      .filter(({ day, index }) => {
        if (index === sourceIndex) return false;
        return day.dayOfWeek >= 1 && day.dayOfWeek <= 5;
      })
      .map(({ index }) => index);

    applyHoursToDays(
      sourceIndex,
      targets,
      "Horário aplicado de segunda a sexta",
    );
  }

  function applyToFullWeek(sourceIndex: number) {
    const targets = getValues("days")
      .map((_, index) => index)
      .filter((index) => index !== sourceIndex);

    applyHoursToDays(sourceIndex, targets, "Horário aplicado a toda a semana");
  }

  function applyToDay(sourceIndex: number, targetIndex: number) {
    const target = getValues(`days.${targetIndex}`);
    const label =
      DAY_OF_WEEK_LABELS_PT[target?.dayOfWeek ?? -1] ?? "o dia selecionado";

    applyHoursToDays(
      sourceIndex,
      [targetIndex],
      `Horário copiado para ${label}`,
    );
  }

  const selectedField = fields[selectedIndex];
  const selectedDay = days?.[selectedIndex];
  const selectedDayOfWeek =
    selectedDay?.dayOfWeek ?? selectedField?.dayOfWeek ?? 1;
  const selectedIsClosed = selectedDay?.isClosed ?? true;
  const selectedIntervals = selectedDay?.intervals ?? [];

  return (
    <form
      id={CLINIC_HOURS_FORM_ID}
      onSubmit={onSubmit}
      className="flex flex-col gap-6"
      noValidate>
      {formError ? (
        <FormErrorAlert message={formError.message} />
      ) : null}

      <p className="text-sm text-muted-foreground">
        Selecione um dia para editar. Use “Copiar este horário” para repetir o
        mesmo padrão em outros dias.
      </p>

      {otherDaysWithErrors.length > 0 ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <p className="font-medium">Há erros em outros dias:</p>
          <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {otherDaysWithErrors.map((entry) => (
              <li key={entry.index}>
                <button
                  type="button"
                  className="underline underline-offset-2 hover:no-underline"
                  onClick={() => setSelectedIndex(entry.index)}>
                  {entry.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          aria-label="Dias da semana"
          className="-mx-1 flex gap-1 overflow-x-auto px-1 py-1">
          {fields.map((field, index) => {
            const dayOfWeek = days?.[index]?.dayOfWeek ?? field.dayOfWeek;
            const isClosed = days?.[index]?.isClosed ?? true;
            const intervals = days?.[index]?.intervals ?? [];
            const shortLabel =
              DAY_OF_WEEK_SHORT_PT[dayOfWeek] ?? `Dia ${dayOfWeek}`;
            const fullLabel = DAY_OF_WEEK_LABELS_PT[dayOfWeek] ?? shortLabel;
            const summary = formatDayHoursSummary({ isClosed, intervals });
            const isSelected = index === selectedIndex;
            const hasError = Boolean(errors.days?.[index]);
            const tabId = `clinic-hours-tab-${dayOfWeek}`;
            const panelId = `clinic-hours-panel-${dayOfWeek}`;

            return (
              <button
                key={field.id}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isSelected}
                aria-controls={panelId}
                aria-label={`${fullLabel}, ${summary}${hasError ? ", com erro de validação" : ""}`}
                tabIndex={isSelected ? 0 : -1}
                disabled={isPending}
                className={cn(
                  "flex min-w-26 shrink-0 flex-col items-center gap-0.5 rounded-md border px-2.5 py-2 text-center transition-colors",
                  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  isSelected
                    ? "border-foreground/20 bg-muted text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  hasError && "border-destructive/50 text-destructive",
                )}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                    return;
                  }
                  event.preventDefault();
                  const delta = event.key === "ArrowRight" ? 1 : -1;
                  const next = (index + delta + fields.length) % fields.length;
                  setSelectedIndex(next);
                  const nextDay =
                    days?.[next]?.dayOfWeek ?? fields[next]?.dayOfWeek;
                  document
                    .getElementById(`clinic-hours-tab-${nextDay}`)
                    ?.focus();
                }}>
                <span aria-hidden className="text-sm font-medium">
                  {shortLabel}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "max-w-20 truncate text-[0.65rem] leading-tight",
                    isSelected
                      ? "text-muted-foreground"
                      : "text-muted-foreground/80",
                    hasError && "text-destructive",
                  )}>
                  {summary}
                </span>
              </button>
            );
          })}
        </div>

        {selectedField ? (
          <div
            role="tabpanel"
            id={`clinic-hours-panel-${selectedDayOfWeek}`}
            aria-labelledby={`clinic-hours-tab-${selectedDayOfWeek}`}
            className="rounded-lg border border-border px-4 py-5">
            <ClinicHoursDayRow
              index={selectedIndex}
              dayOfWeek={selectedDayOfWeek}
              isClosed={selectedIsClosed}
              intervals={selectedIntervals}
              disabled={isPending}
              errors={errors.days}
              register={register}
              onToggleOpen={(open) => setDayOpen(selectedIndex, open)}
              onIntervalsChange={(next) => setDayIntervals(selectedIndex, next)}
              onTimeFieldChange={() => {
                if (!isSubmitted) return;
                void trigger(`days.${selectedIndex}`);
              }}
              copyActions={
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => applyToWeekdays(selectedIndex)}>
                    Segunda a sexta
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => applyToFullWeek(selectedIndex)}>
                    Toda a semana
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}>
                        Outro dia
                        <CaretDownIcon className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {fields.map((field, index) => {
                        if (index === selectedIndex) return null;
                        const dayOfWeek =
                          days?.[index]?.dayOfWeek ?? field.dayOfWeek;
                        return (
                          <DropdownMenuItem
                            key={field.id}
                            onSelect={() => applyToDay(selectedIndex, index)}>
                            {DAY_OF_WEEK_LABELS_PT[dayOfWeek] ??
                              `Dia ${dayOfWeek}`}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
            />
          </div>
        ) : null}
      </div>

      {/* Keep dayOfWeek registered for non-selected days */}
      {fields.map((field, index) =>
        index === selectedIndex ? null : (
          <input
            key={`hidden-dow-${field.id}`}
            type="hidden"
            {...register(`days.${index}.dayOfWeek`, { valueAsNumber: true })}
          />
        ),
      )}

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
