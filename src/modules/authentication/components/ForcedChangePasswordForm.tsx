"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
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
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

type ChangePasswordValues = z.input<typeof changePasswordSchema>
type ChangePasswordOutput = z.output<typeof changePasswordSchema>

export function ForcedChangePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next")
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const {
    register,
    handleSubmit,
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
    onSuccess: (auth) => {
      toast.success("Senha atualizada")
      router.replace(getPostAuthRedirect(auth, next))
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
      className="flex w-full max-w-sm flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Defina sua senha
        </h1>
        <p className="text-sm text-muted-foreground">
          Por segurança, troque a senha provisória antes de continuar.
        </p>
      </div>

      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.currentPassword)}>
          <FieldLabel htmlFor="current-password">Senha provisória</FieldLabel>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.currentPassword)}
            {...register("currentPassword")}
          />
          <FieldError>{errors.currentPassword?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.newPassword)}>
          <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.newPassword)}
            {...register("newPassword")}
          />
          <FieldError>{errors.newPassword?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirm-password">Confirmar nova senha</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={changePassword.isPending}>
        {changePassword.isPending ? <Spinner /> : null}
        Salvar e continuar
      </Button>
    </form>
  )
}
