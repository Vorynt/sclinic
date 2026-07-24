"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
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
import { useUpdateAccountProfileMutation } from "@/modules/users/hooks/use-account-mutations"
import { updateAccountProfileSchema } from "@/modules/users/schemas/account.schema"
import type { AccountProfile } from "@/modules/users/types/account"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

type ProfileFormValues = z.input<typeof updateAccountProfileSchema>
type ProfileFormOutput = z.output<typeof updateAccountProfileSchema>

type AccountProfileFormProps = {
  profile: AccountProfile
}

export function AccountProfileForm({ profile }: AccountProfileFormProps) {
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues, unknown, ProfileFormOutput>({
    resolver: zodResolver(updateAccountProfileSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? "",
    },
  })

  useEffect(() => {
    reset({
      name: profile.name,
      phone: profile.phone ?? "",
    })
  }, [profile, reset])

  const updateProfile = useUpdateAccountProfileMutation({
    onSuccess: () => {
      toast.success("Dados pessoais atualizados")
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
    updateProfile.mutate(data)
  })

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-6" noValidate>
      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="account-name">Nome</FieldLabel>
          <Input
            id="account-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name) || undefined}
            disabled={updateProfile.isPending}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="account-email">E-mail</FieldLabel>
          <Input
            id="account-email"
            type="email"
            value={profile.email}
            disabled
            readOnly
            autoComplete="email"
          />
          <p className="text-xs text-muted-foreground">
            A alteração de e-mail estará disponível em breve.
          </p>
        </Field>

        <Field data-invalid={Boolean(errors.phone) || undefined}>
          <FieldLabel htmlFor="account-phone">Telefone</FieldLabel>
          <Input
            id="account-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone) || undefined}
            disabled={updateProfile.isPending}
            {...register("phone")}
          />
          <FieldError errors={[errors.phone]} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={updateProfile.isPending || !isDirty}
        className="w-fit"
      >
        {updateProfile.isPending ? <Spinner /> : null}
        Salvar alterações
      </Button>
    </form>
  )
}
