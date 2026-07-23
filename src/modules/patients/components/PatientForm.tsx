"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useHookFormMask } from "use-mask-input"
import type { z } from "zod"

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
import { Spinner } from "@/components/ui/spinner"
import {
  useCreatePatientMutation,
  useUpdatePatientMutation,
} from "@/modules/patients/hooks/use-patient-mutations"
import { createPatientSchema } from "@/modules/patients/schemas/patient.schema"
import type { Patient } from "@/modules/patients/types/patient"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"
import { MASK_INPUT_OPTIONS, MASKS } from "@/utils/mask"

type PatientFormValues = z.input<typeof createPatientSchema>
type PatientFormOutput = z.output<typeof createPatientSchema>

type PatientFormProps = {
  patient?: Patient | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function PatientForm({ patient, onSuccess, onCancel }: PatientFormProps) {
  const isEditing = Boolean(patient)
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues, unknown, PatientFormOutput>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      name: patient?.name ?? "",
      cpf: patient?.cpf ?? "",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      birthDate: patient?.birthDate ?? "",
    },
  })

  const registerWithMask = useHookFormMask(register)

  function handleError(error: unknown) {
    if (isAppError(error)) {
      setFormError({ message: error.message, code: error.code })
      return
    }
    setFormError({
      message: getClientMessage(ErrorCode.INTERNAL_ERROR),
      code: ErrorCode.INTERNAL_ERROR,
    })
  }

  const createPatient = useCreatePatientMutation({
    onSuccess: () => {
      toast.success("Paciente cadastrado com sucesso")
      setFormError(null)
      onSuccess?.()
    },
    onError: handleError,
  })

  const updatePatient = useUpdatePatientMutation({
    onSuccess: () => {
      toast.success("Paciente atualizado com sucesso")
      setFormError(null)
      onSuccess?.()
    },
    onError: handleError,
  })

  const isPending = createPatient.isPending || updatePatient.isPending

  const onSubmit = handleSubmit((data) => {
    setFormError(null)
    if (patient) {
      updatePatient.mutate({ id: patient.id, ...data })
      return
    }
    createPatient.mutate(data)
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="patient-name">Nome</FieldLabel>
          <Input
            id="patient-name"
            autoComplete="name"
            placeholder="Nome completo"
            aria-invalid={Boolean(errors.name) || undefined}
            disabled={isPending}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.cpf) || undefined}>
          <FieldLabel htmlFor="patient-cpf">CPF</FieldLabel>
          <Input
            id="patient-cpf"
            placeholder="000.000.000-00"
            inputMode="numeric"
            aria-invalid={Boolean(errors.cpf) || undefined}
            disabled={isPending}
            {...registerWithMask("cpf", MASKS.cpf, MASK_INPUT_OPTIONS)}
          />
          <FieldError errors={[errors.cpf]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.phone) || undefined}>
            <FieldLabel htmlFor="patient-phone">Telefone</FieldLabel>
            <Input
              id="patient-phone"
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              inputMode="numeric"
              aria-invalid={Boolean(errors.phone) || undefined}
              disabled={isPending}
              {...registerWithMask("phone", MASKS.phone, MASK_INPUT_OPTIONS)}
            />
            <FieldError errors={[errors.phone]} />
          </Field>

          <Field data-invalid={Boolean(errors.email) || undefined}>
            <FieldLabel htmlFor="patient-email">E-mail</FieldLabel>
            <Input
              id="patient-email"
              type="email"
              autoComplete="email"
              placeholder="Opcional"
              aria-invalid={Boolean(errors.email) || undefined}
              disabled={isPending}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.birthDate) || undefined}>
          <FieldLabel htmlFor="patient-birth-date">
            Data de nascimento
          </FieldLabel>
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="patient-birth-date"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Selecione a data"
                aria-invalid={Boolean(errors.birthDate) || undefined}
                disabled={isPending}
                captionLayout="dropdown"
                startMonth={new Date(1900, 0)}
                endMonth={new Date()}
                disabledDates={{ after: new Date() }}
              />
            )}
          />
          <FieldError errors={[errors.birthDate]} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner /> : null}
          {isEditing ? "Salvar alterações" : "Cadastrar paciente"}
        </Button>
      </div>
    </form>
  )
}
