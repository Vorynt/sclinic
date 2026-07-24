"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { clinicWeeklyHoursSchema } from "@/modules/clinics/schemas/clinic-hours.schema";
import {
  DAY_OF_WEEK_SHORT_PT,
  type ClinicTimeInterval,
} from "@/modules/clinics/types/clinic-hours";

type HoursFormValues = z.input<typeof clinicWeeklyHoursSchema>;

type ClinicHoursDayRowProps = {
  index: number;
  dayOfWeek: number;
  isClosed: boolean;
  intervals: ClinicTimeInterval[];
  disabled?: boolean;
  errors?: FieldErrors<HoursFormValues>["days"];
  register: UseFormRegister<HoursFormValues>;
  onToggleOpen: (open: boolean) => void;
  onIntervalsChange: (intervals: ClinicTimeInterval[]) => void;
  /** Contextual action — typically on Monday: reuse this schedule Mon–Fri. */
  onApplyToWeekdays?: () => void;
};

function TimeRangeInputs({
  dayIndex,
  intervalIndex,
  disabled,
  register,
  invalidOpens,
  invalidCloses,
}: {
  dayIndex: number;
  intervalIndex: number;
  disabled?: boolean;
  register: UseFormRegister<HoursFormValues>;
  invalidOpens?: boolean;
  invalidCloses?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="time"
        className="h-8 w-29"
        disabled={disabled}
        aria-label={intervalIndex === 0 ? "Abertura" : "Retorno após a pausa"}
        aria-invalid={invalidOpens || undefined}
        {...register(`days.${dayIndex}.intervals.${intervalIndex}.opensAt`)}
      />
      <span className="text-muted-foreground" aria-hidden>
        –
      </span>
      <Input
        type="time"
        className="h-8 w-29"
        disabled={disabled}
        aria-label={
          intervalIndex === 0 ? "Início da pausa ou fechamento" : "Fechamento"
        }
        aria-invalid={invalidCloses || undefined}
        {...register(`days.${dayIndex}.intervals.${intervalIndex}.closesAt`)}
      />
    </div>
  );
}

export function ClinicHoursDayRow({
  index,
  dayOfWeek,
  isClosed,
  intervals,
  disabled,
  errors,
  register,
  onToggleOpen,
  onIntervalsChange,
  onApplyToWeekdays,
}: ClinicHoursDayRowProps) {
  const dayErrors = errors?.[index];
  const hasLunchBreak = intervals.length === 2;
  const label = DAY_OF_WEEK_SHORT_PT[dayOfWeek] ?? `Dia ${dayOfWeek}`;

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr] gap-3 px-4 py-3.5 sm:grid-cols-[6.5rem_auto_minmax(0,1fr)] sm:items-start",
      )}>
      <p className="text-sm font-medium text-foreground col-span-1 sm:pt-1.5">
        {label}
      </p>

      <div className="flex items-center justify-end gap-2 sm:pt-1.5">
        <label
          htmlFor={`day-${index}-open`}
          className="text-xs text-muted-foreground">
          {isClosed ? "Fechado" : "Aberto"}
        </label>
        <Switch
          id={`day-${index}-open`}
          checked={!isClosed}
          disabled={disabled}
          aria-label={`${label}: ${isClosed ? "fechado" : "aberto"}`}
          onCheckedChange={onToggleOpen}
        />
      </div>

      <input
        type="hidden"
        {...register(`days.${index}.dayOfWeek`, { valueAsNumber: true })}
      />

      <div className="min-w-0 sm:col-start-3">
        {isClosed ? (
          <p className="text-sm text-muted-foreground sm:pt-1.5">Não abre</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <TimeRangeInputs
                dayIndex={index}
                intervalIndex={0}
                disabled={disabled}
                register={register}
                invalidOpens={Boolean(dayErrors?.intervals?.[0]?.opensAt)}
                invalidCloses={Boolean(dayErrors?.intervals?.[0]?.closesAt)}
              />

              {hasLunchBreak ? (
                <>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    e
                  </span>
                  <TimeRangeInputs
                    dayIndex={index}
                    intervalIndex={1}
                    disabled={disabled}
                    register={register}
                    invalidOpens={Boolean(dayErrors?.intervals?.[1]?.opensAt)}
                    invalidCloses={Boolean(dayErrors?.intervals?.[1]?.closesAt)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled}
                    aria-label="Remover pausa"
                    title="Remover pausa"
                    onClick={() => onIntervalsChange(intervals.slice(0, 1))}>
                    <MinusIcon className="size-3.5" />
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  disabled={disabled}
                  onClick={() => {
                    const first = intervals[0];
                    onIntervalsChange([
                      first ?? { opensAt: "08:00", closesAt: "12:00" },
                      {
                        opensAt: first?.closesAt ?? "14:00",
                        closesAt: "18:00",
                      },
                    ]);
                  }}>
                  <PlusIcon className="size-3.5" />
                  Pausa
                </Button>
              )}
            </div>

            <FieldError
              errors={[
                dayErrors?.intervals?.[0]?.opensAt,
                dayErrors?.intervals?.[0]?.closesAt,
                dayErrors?.intervals?.[1]?.opensAt,
                dayErrors?.intervals?.[1]?.closesAt,
                !Array.isArray(dayErrors?.intervals)
                  ? dayErrors?.intervals
                  : undefined,
              ]}
            />

            {onApplyToWeekdays ? (
              <Button
                type="button"
                variant="link"
                size="xs"
                className="h-auto w-fit px-0"
                disabled={disabled}
                onClick={onApplyToWeekdays}>
                Aplicar de segunda a sexta
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
