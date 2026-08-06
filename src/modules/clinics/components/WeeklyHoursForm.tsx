"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useId, useState, type ReactNode } from "react";
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
import { clinicWeeklyHoursSchema } from "@/modules/clinics/schemas/clinic-hours.schema";
import {
  DAY_OF_WEEK_DISPLAY_ORDER,
  DAY_OF_WEEK_LABELS_PT,
  DAY_OF_WEEK_SHORT_PT,
  type ClinicTimeInterval,
  type ClinicWeeklyHours,
} from "@/modules/clinics/types/clinic-hours";
import { formatDayHoursSummary } from "@/modules/clinics/utils/format-day-hours-summary";

type HoursFormValues = z.input<typeof clinicWeeklyHoursSchema>;
type HoursFormOutput = z.output<typeof clinicWeeklyHoursSchema>;

export type WeeklyHoursFormProps = {
  initialDays: ClinicWeeklyHours;
  isPending?: boolean;
  submitLabel?: string;
  formId?: string;
  closedDayMessage?: string;
  description?: string;
  showSkip?: boolean;
  skipLabel?: string;
  isSkipping?: boolean;
  formError?: { message: string; code: string } | null;
  /** Extra actions rendered next to the submit button (e.g. Cancel). */
  secondaryActions?: ReactNode;
  className?: string;
  onSubmit: (data: HoursFormOutput) => void;
  onSkip?: () => void;
};

const DEFAULT_OPEN_INTERVAL: ClinicTimeInterval = {
  opensAt: "08:00",
  closesAt: "18:00",
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

export function WeeklyHoursForm({
  initialDays,
  isPending = false,
  submitLabel = "Salvar horários",
  formId,
  closedDayMessage = "A clínica não atende neste dia.",
  description = "Selecione um dia para editar. Use “Copiar este horário” para repetir o mesmo padrão em outros dias.",
  showSkip = false,
  skipLabel = "Configurar depois",
  isSkipping = false,
  formError = null,
  secondaryActions,
  className,
  onSubmit,
  onSkip,
}: WeeklyHoursFormProps) {
  const generatedId = useId();
  const resolvedFormId = formId ?? `weekly-hours-form-${generatedId}`;
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
    reValidateMode: "onChange",
  });

  const { fields } = useFieldArray({
    control,
    name: "days",
  });

  const busy = isPending || isSkipping;
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

  const submit = handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (validationErrors) => {
      const firstErrorIndex = fields.findIndex((_, index) =>
        Boolean(validationErrors.days?.[index]),
      );
      if (firstErrorIndex >= 0) {
        setSelectedIndex(firstErrorIndex);
      }
      scrollFormToTop(document.getElementById(resolvedFormId));
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
  const tabPrefix = resolvedFormId;

  return (
    <form
      id={resolvedFormId}
      onSubmit={submit}
      className={cn("flex flex-col gap-6", className)}
      noValidate>
      {formError ? <FormErrorAlert message={formError.message} /> : null}

      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}

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
            const tabId = `${tabPrefix}-tab-${dayOfWeek}`;
            const panelId = `${tabPrefix}-panel-${dayOfWeek}`;

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
                disabled={busy}
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
                    .getElementById(`${tabPrefix}-tab-${nextDay}`)
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
            id={`${tabPrefix}-panel-${selectedDayOfWeek}`}
            aria-labelledby={`${tabPrefix}-tab-${selectedDayOfWeek}`}
            className="rounded-lg border border-border px-4 py-5">
            <ClinicHoursDayRow
              index={selectedIndex}
              dayOfWeek={selectedDayOfWeek}
              isClosed={selectedIsClosed}
              intervals={selectedIntervals}
              disabled={busy}
              closedDayMessage={closedDayMessage}
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
                    disabled={busy}
                    onClick={() => applyToWeekdays(selectedIndex)}>
                    Segunda a sexta
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => applyToFullWeek(selectedIndex)}>
                    Toda a semana
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy}>
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
        {showSkip ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => onSkip?.()}>
            {isSkipping ? (
              <>
                <Spinner />
                Aplicando…
              </>
            ) : (
              skipLabel
            )}
          </Button>
        ) : null}
        {secondaryActions}
        <Button type="submit" disabled={busy}>
          {isPending ? (
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
