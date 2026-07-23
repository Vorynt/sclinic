"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
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
            aria-invalid={Boolean(errors.cpf) || undefined}
            disabled={isPending}
            {...register("cpf")}
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
              placeholder="Opcional"
              aria-invalid={Boolean(errors.phone) || undefined}
              disabled={isPending}
              {...register("phone")}
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
          <Input
            id="patient-birth-date"
            type="date"
            aria-invalid={Boolean(errors.birthDate) || undefined}
            disabled={isPending}
            {...register("birthDate")}
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
