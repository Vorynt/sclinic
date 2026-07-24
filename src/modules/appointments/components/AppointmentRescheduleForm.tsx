"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { addMinutes, differenceInMinutes, startOfDay } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { FormErrorAlert } from "@/components/ui/form-error-alert"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { SuggestedAvailabilitySlots } from "@/modules/appointments/components/SuggestedAvailabilitySlots"
import { isSelfScheduleOnlyRole } from "@/modules/appointments/constants/appointments"
import { useRescheduleAppointmentMutation } from "@/modules/appointments/hooks/use-appointment-mutations"
import type { Appointment } from "@/modules/appointments/types/appointment"
import { APPOINTMENT_DURATION_OPTIONS } from "@/modules/appointments/utils/calendar-constants"
import { readSuggestedSlotsFromMeta } from "@/modules/appointments/utils/suggested-slots"
import { useAuthSession } from "@/modules/authentication/hooks/use-auth"
import { ProfessionalCombobox } from "@/modules/professionals/components/ProfessionalCombobox"
import { useProfessionalsForSchedulingQuery } from "@/modules/professionals/hooks/use-professionals"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"
import { parseISODate, toISODate } from "@/utils/date"

const rescheduleFormSchema = z
  .object({
    professionalId: z.string().uuid("Selecione um profissional"),
    date: z.string().trim().min(1, "Selecione a data"),
    startTime: z
      .string()
      .trim()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido"),
    durationMinutes: z.string().min(1, "Selecione a duração"),
  })
  .superRefine((data, ctx) => {
    const day = parseISODate(data.date)
    if (!day) return

    const [hours, minutes] = data.startTime.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return

    const startsAt = new Date(day)
    startsAt.setHours(hours, minutes, 0, 0)

    if (startsAt.getTime() <= Date.now()) {
      ctx.addIssue({
        code: "custom",
        message: "Não é possível remarcar para um horário no passado.",
        path: ["startTime"],
      })
    }
  })

type RescheduleFormValues = z.input<typeof rescheduleFormSchema>
type RescheduleFormOutput = z.output<typeof rescheduleFormSchema>

type AppointmentRescheduleFormProps = {
  appointment: Appointment
  onSuccess: (appointment: Appointment) => void
  onCancel: () => void
}

function resolveDurationMinutes(startsAt: Date, endsAt: Date): string {
  const minutes = Math.max(15, differenceInMinutes(endsAt, startsAt))
  if (
    (APPOINTMENT_DURATION_OPTIONS as readonly number[]).includes(minutes)
  ) {
    return String(minutes)
  }
  return String(minutes)
}

export function AppointmentRescheduleForm({
  appointment,
  onSuccess,
  onCancel,
}: AppointmentRescheduleFormProps) {
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([])

  const today = startOfDay(new Date())
  const initialDuration = resolveDurationMinutes(
    appointment.startsAt,
    appointment.endsAt,
  )

  const durationOptions = useMemo(() => {
    const minutes = Number(initialDuration)
    if ((APPOINTMENT_DURATION_OPTIONS as readonly number[]).includes(minutes)) {
      return [...APPOINTMENT_DURATION_OPTIONS]
    }
    return [...APPOINTMENT_DURATION_OPTIONS, minutes].sort((a, b) => a - b)
  }, [initialDuration])

  const sessionQuery = useAuthSession()
  const isProfessionalLocked = isSelfScheduleOnlyRole(
    sessionQuery.data?.membership?.roleKey,
  )
  const professionalsQuery = useProfessionalsForSchedulingQuery()

  const form = useForm<RescheduleFormValues, unknown, RescheduleFormOutput>({
    resolver: zodResolver(rescheduleFormSchema),
    defaultValues: {
      professionalId: appointment.professionalId ?? "",
      date: toISODate(appointment.startsAt),
      startTime: `${String(appointment.startsAt.getHours()).padStart(2, "0")}:${String(
        appointment.startsAt.getMinutes(),
      ).padStart(2, "0")}`,
      durationMinutes: initialDuration,
    },
  })

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form

  const professionals = professionalsQuery.data ?? []
  const lockedProfessionalLabel = isProfessionalLocked
    ? professionals[0]
      ? professionals[0].specialty
        ? `${professionals[0].fullName} · ${professionals[0].specialty}`
        : professionals[0].fullName
      : null
    : appointment.professionalName

  useEffect(() => {
    if (!isProfessionalLocked) return
    const selfProfessional = professionalsQuery.data?.[0]
    if (!selfProfessional) return
    setValue("professionalId", selfProfessional.id, {
      shouldValidate: true,
    })
  }, [isProfessionalLocked, professionalsQuery.data, setValue])

  function clearAvailabilityFeedback() {
    setFormError(null)
    setSuggestedSlots([])
  }

  function handleError(error: unknown) {
    if (isAppError(error)) {
      setFormError({ message: error.message, code: error.code })
      setSuggestedSlots(readSuggestedSlotsFromMeta(error.meta))
      return
    }
    setFormError({
      message: getClientMessage(ErrorCode.INTERNAL_ERROR),
      code: ErrorCode.INTERNAL_ERROR,
    })
    setSuggestedSlots([])
  }

  const rescheduleAppointment = useRescheduleAppointmentMutation({
    onSuccess: (updated) => {
      toast.success("Agendamento remarcado")
      clearAvailabilityFeedback()
      onSuccess(updated)
    },
    onError: handleError,
  })

  const onSubmit = handleSubmit((data) => {
    clearAvailabilityFeedback()

    const startDate = parseISODate(data.date)
    if (!startDate) {
      setFormError({
        message: "Data inválida",
        code: ErrorCode.VALIDATION_FAILED,
      })
      return
    }

    const [hours, minutes] = data.startTime.split(":").map(Number)
    const startsAt = new Date(startDate)
    startsAt.setHours(hours, minutes, 0, 0)
    const endsAt = addMinutes(startsAt, Number(data.durationMinutes))

    rescheduleAppointment.mutate({
      id: appointment.id,
      professionalId: data.professionalId,
      startsAt,
      endsAt,
    })
  })

  const isPending = rescheduleAppointment.isPending
  const isProfessionalsEmpty =
    !professionalsQuery.isLoading && professionals.length === 0

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.professionalId) || undefined}>
          <FieldLabel>Profissional</FieldLabel>
          <Controller
            name="professionalId"
            control={control}
            render={({ field }) => (
              <ProfessionalCombobox
                value={field.value}
                onValueChange={field.onChange}
                displayLabel={lockedProfessionalLabel}
                disabled={
                  isPending ||
                  sessionQuery.isLoading ||
                  professionalsQuery.isLoading ||
                  isProfessionalsEmpty ||
                  isProfessionalLocked
                }
                aria-invalid={Boolean(errors.professionalId) || undefined}
              />
            )}
          />
          <FieldError errors={[errors.professionalId]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-1">
          <Field data-invalid={Boolean(errors.date) || undefined}>
            <FieldLabel htmlFor="reschedule-date">Data</FieldLabel>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="reschedule-date"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={isPending}
                  startMonth={today}
                  disabledDates={{ before: today }}
                  aria-invalid={Boolean(errors.date) || undefined}
                />
              )}
            />
            <FieldError errors={[errors.date]} />
          </Field>

          <Field data-invalid={Boolean(errors.startTime) || undefined}>
            <FieldLabel htmlFor="reschedule-start-time">
              Horário início
            </FieldLabel>
            <Input
              id="reschedule-start-time"
              type="time"
              aria-invalid={Boolean(errors.startTime) || undefined}
              disabled={isPending}
              {...register("startTime")}
            />
            <FieldError errors={[errors.startTime]} />
          </Field>

          <Field data-invalid={Boolean(errors.durationMinutes) || undefined}>
            <FieldLabel>Duração</FieldLabel>
            <Controller
              name="durationMinutes"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger
                    aria-invalid={
                      Boolean(errors.durationMinutes) || undefined
                    }
                  >
                    <SelectValue placeholder="Duração" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((minutes) => (
                      <SelectItem key={minutes} value={String(minutes)}>
                        {minutes} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.durationMinutes]} />
          </Field>
        </div>

        {formError ? (
          <SuggestedAvailabilitySlots
            slots={suggestedSlots}
            onSelect={clearAvailabilityFeedback}
          />
        ) : null}
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Voltar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner /> : null}
          Remarcar
        </Button>
      </div>
    </form>
  )
}
