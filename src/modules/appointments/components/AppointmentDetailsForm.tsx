"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { FormErrorAlert } from "@/components/ui/form-error-alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { APPOINTMENT_TYPE_LABELS } from "@/modules/appointments/constants/appointments"
import { useUpdateAppointmentDetailsMutation } from "@/modules/appointments/hooks/use-appointment-mutations"
import { appointmentTypeSchema } from "@/modules/appointments/schemas/appointment.schema"
import type {
  Appointment,
  AppointmentType,
} from "@/modules/appointments/types/appointment"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

const appointmentTypeOptions = Object.entries(APPOINTMENT_TYPE_LABELS) as [
  AppointmentType,
  string,
][]

const detailsFormSchema = z.object({
  type: appointmentTypeSchema,
  reason: z
    .string()
    .trim()
    .max(300, "Motivo deve ter no máximo 300 caracteres"),
  notes: z
    .string()
    .trim()
    .max(1000, "Observações devem ter no máximo 1000 caracteres"),
})

type DetailsFormValues = z.input<typeof detailsFormSchema>
type DetailsFormOutput = z.output<typeof detailsFormSchema>

type AppointmentDetailsFormProps = {
  appointment: Appointment
  onSuccess: (appointment: Appointment) => void
  onCancel: () => void
}

export function AppointmentDetailsForm({
  appointment,
  onSuccess,
  onCancel,
}: AppointmentDetailsFormProps) {
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const form = useForm<DetailsFormValues, unknown, DetailsFormOutput>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues: {
      type: appointment.type,
      reason: appointment.reason ?? "",
      notes: appointment.notes ?? "",
    },
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form

  const updateDetails = useUpdateAppointmentDetailsMutation({
    onSuccess: (updated) => {
      toast.success("Detalhes atualizados")
      setFormError(null)
      onSuccess(updated)
    },
    onError: (error) => {
      if (isAppError(error)) {
        setFormError({ message: error.message, code: error.code })
        return
      }
      setFormError({
        message: getClientMessage(ErrorCode.INTERNAL_ERROR),
        code: ErrorCode.INTERNAL_ERROR,
      })
    },
  })

  const onSubmit = handleSubmit((data) => {
    setFormError(null)
    updateDetails.mutate({
      id: appointment.id,
      type: data.type,
      reason: data.reason,
      notes: data.notes,
    })
  })

  const isPending = updateDetails.isPending

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.type) || undefined}>
          <FieldLabel>Tipo da consulta</FieldLabel>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger
                  aria-invalid={Boolean(errors.type) || undefined}
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypeOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.type]} />
        </Field>

        <Field data-invalid={Boolean(errors.reason) || undefined}>
          <FieldLabel htmlFor="appointment-details-reason">Motivo</FieldLabel>
          <Textarea
            id="appointment-details-reason"
            placeholder="Opcional"
            aria-invalid={Boolean(errors.reason) || undefined}
            disabled={isPending}
            {...register("reason")}
          />
          <FieldError errors={[errors.reason]} />
        </Field>

        <Field data-invalid={Boolean(errors.notes) || undefined}>
          <FieldLabel htmlFor="appointment-details-notes">
            Observações
          </FieldLabel>
          <Textarea
            id="appointment-details-notes"
            placeholder="Opcional"
            aria-invalid={Boolean(errors.notes) || undefined}
            disabled={isPending}
            {...register("notes")}
          />
          <FieldError errors={[errors.notes]} />
        </Field>
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
          Salvar
        </Button>
      </div>
    </form>
  )
}
