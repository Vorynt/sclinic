"use client"

import { MinusIcon, PlusIcon } from "@phosphor-icons/react"
import type { ReactNode } from "react"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { clinicWeeklyHoursSchema } from "@/modules/clinics/schemas/clinic-hours.schema"
import {
  DAY_OF_WEEK_LABELS_PT,
  type ClinicTimeInterval,
} from "@/modules/clinics/types/clinic-hours"

type HoursFormValues = z.input<typeof clinicWeeklyHoursSchema>

type ClinicHoursDayRowProps = {
  index: number
  dayOfWeek: number
  isClosed: boolean
  intervals: ClinicTimeInterval[]
  disabled?: boolean
  errors?: FieldErrors<HoursFormValues>["days"]
  register: UseFormRegister<HoursFormValues>
  onToggleOpen: (open: boolean) => void
  onIntervalsChange: (intervals: ClinicTimeInterval[]) => void
  /** Revalidate the whole day so Zod refine errors on sibling paths clear. */
  onTimeFieldChange?: () => void
  copyActions?: ReactNode
}

function TimeRangeInputs({
  dayIndex,
  intervalIndex,
  dayLabel,
  opensLabel,
  closesLabel,
  disabled,
  register,
  onTimeFieldChange,
  invalidOpens,
  invalidCloses,
}: {
  dayIndex: number
  intervalIndex: number
  dayLabel: string
  opensLabel: string
  closesLabel: string
  disabled?: boolean
  register: UseFormRegister<HoursFormValues>
  onTimeFieldChange?: () => void
  invalidOpens?: boolean
  invalidCloses?: boolean
}) {
  const opensAt = register(
    `days.${dayIndex}.intervals.${intervalIndex}.opensAt`,
  )
  const closesAt = register(
    `days.${dayIndex}.intervals.${intervalIndex}.closesAt`,
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="time"
        className="h-9 w-32"
        disabled={disabled}
        aria-label={`${dayLabel}, ${opensLabel}`}
        aria-invalid={invalidOpens || undefined}
        {...opensAt}
        onChange={(event) => {
          void opensAt.onChange(event).then(() => {
            onTimeFieldChange?.()
          })
        }}
      />
      <span className="text-muted-foreground" aria-hidden>
        –
      </span>
      <Input
        type="time"
        className="h-9 w-32"
        disabled={disabled}
        aria-label={`${dayLabel}, ${closesLabel}`}
        aria-invalid={invalidCloses || undefined}
        {...closesAt}
        onChange={(event) => {
          void closesAt.onChange(event).then(() => {
            onTimeFieldChange?.()
          })
        }}
      />
    </div>
  )
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
  onTimeFieldChange,
  copyActions,
}: ClinicHoursDayRowProps) {
  const dayErrors = errors?.[index]
  const hasLunchBreak = intervals.length === 2
  const dayLabel = DAY_OF_WEEK_LABELS_PT[dayOfWeek] ?? `Dia ${dayOfWeek}`
  const openSwitchId = `day-${index}-open`

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {dayLabel}
        </h3>

        <div className="flex items-center gap-2">
          <label
            htmlFor={openSwitchId}
            className="text-sm text-muted-foreground"
          >
            {isClosed ? "Fechado" : "Aberto"}
          </label>
          <Switch
            id={openSwitchId}
            checked={!isClosed}
            disabled={disabled}
            aria-label={`${dayLabel}: ${isClosed ? "fechado" : "aberto"}`}
            onCheckedChange={onToggleOpen}
          />
        </div>
      </div>

      <input
        type="hidden"
        {...register(`days.${index}.dayOfWeek`, { valueAsNumber: true })}
      />

      {isClosed ? (
        <p className="text-sm text-muted-foreground">
          A clínica não atende neste dia.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">
              {hasLunchBreak ? "Manhã" : "Horário de atendimento"}
            </p>
            <TimeRangeInputs
              dayIndex={index}
              intervalIndex={0}
              dayLabel={dayLabel}
              opensLabel="abertura"
              closesLabel={
                hasLunchBreak ? "início da pausa" : "fechamento"
              }
              disabled={disabled}
              register={register}
              onTimeFieldChange={onTimeFieldChange}
              invalidOpens={Boolean(dayErrors?.intervals?.[0]?.opensAt)}
              invalidCloses={Boolean(dayErrors?.intervals?.[0]?.closesAt)}
            />
          </div>

          {hasLunchBreak ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">Tarde</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  disabled={disabled}
                  aria-label={`Remover pausa de ${dayLabel}`}
                  onClick={() => onIntervalsChange(intervals.slice(0, 1))}
                >
                  <MinusIcon className="size-3.5" />
                  Remover pausa
                </Button>
              </div>
              <TimeRangeInputs
                dayIndex={index}
                intervalIndex={1}
                dayLabel={dayLabel}
                opensLabel="retorno após a pausa"
                closesLabel="fechamento"
                disabled={disabled}
                register={register}
                onTimeFieldChange={onTimeFieldChange}
                invalidOpens={Boolean(dayErrors?.intervals?.[1]?.opensAt)}
                invalidCloses={Boolean(dayErrors?.intervals?.[1]?.closesAt)}
              />
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={disabled}
              onClick={() => {
                const first = intervals[0] ?? {
                  opensAt: "08:00",
                  closesAt: "18:00",
                }
                onIntervalsChange([
                  {
                    opensAt: first.opensAt < "12:00" ? first.opensAt : "08:00",
                    closesAt: "12:00",
                  },
                  {
                    opensAt: "14:00",
                    closesAt:
                      first.closesAt > "14:00" ? first.closesAt : "18:00",
                  },
                ])
              }}
            >
              <PlusIcon className="size-3.5" />
              Adicionar pausa de almoço
            </Button>
          )}

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
        </div>
      )}

      {copyActions && !isClosed ? (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground">
            Copiar este horário
          </p>
          {copyActions}
        </div>
      ) : null}
    </div>
  )
}
