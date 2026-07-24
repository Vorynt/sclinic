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
import { useChangePasswordMutation } from "@/modules/authentication/hooks/use-auth"
import { changePasswordSchema } from "@/modules/authentication/schemas/auth.schema"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

type ChangePasswordValues = z.input<typeof changePasswordSchema>
type ChangePasswordOutput = z.output<typeof changePasswordSchema>

export function AccountSecurityForm() {
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues, unknown, ChangePasswordOutput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const changePassword = useChangePasswordMutation({
    onSuccess: () => {
      toast.success("Senha atualizada")
      reset()
      setFormError(null)
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
    changePassword.mutate(data)
  })

  return (
    <form
      onSubmit={onSubmit}
      className="flex max-w-md flex-col gap-6"
      noValidate
    >
      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.currentPassword)}>
          <FieldLabel htmlFor="account-current-password">Senha atual</FieldLabel>
          <Input
            id="account-current-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.currentPassword)}
            disabled={changePassword.isPending}
            {...register("currentPassword")}
          />
          <FieldError>{errors.currentPassword?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.newPassword)}>
          <FieldLabel htmlFor="account-new-password">Nova senha</FieldLabel>
          <Input
            id="account-new-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.newPassword)}
            disabled={changePassword.isPending}
            {...register("newPassword")}
          />
          <FieldError>{errors.newPassword?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="account-confirm-password">
            Confirmar nova senha
          </FieldLabel>
          <Input
            id="account-confirm-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            disabled={changePassword.isPending}
            {...register("confirmPassword")}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={changePassword.isPending}
        className="w-fit"
      >
        {changePassword.isPending ? <Spinner /> : null}
        Atualizar senha
      </Button>
    </form>
  )
}
