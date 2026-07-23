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
import type { AuthContext } from "@/modules/authentication/types/auth"
import { useSetPasswordFromInviteMutation } from "@/modules/users/hooks/use-user-mutations"
import { setPasswordFromInviteSchema } from "@/modules/users/schemas/invitation.schema"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

type SetPasswordValues = z.input<typeof setPasswordFromInviteSchema>
type SetPasswordOutput = z.output<typeof setPasswordFromInviteSchema>

type SetInvitePasswordFormProps = {
  token: string
  email: string
  clinicName: string
  onSuccess?: (auth: AuthContext) => void
}

export function SetInvitePasswordForm({
  token,
  email,
  clinicName,
  onSuccess,
}: SetInvitePasswordFormProps) {
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordValues, unknown, SetPasswordOutput>({
    resolver: zodResolver(setPasswordFromInviteSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
  })

  const setPassword = useSetPasswordFromInviteMutation({
    onSuccess: (auth) => {
      toast.success("Senha definida")
      onSuccess?.(auth)
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
    setPassword.mutate(data)
  })

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-sm flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Crie sua senha
        </h1>
        <p className="text-sm text-muted-foreground">
          Convite para <strong>{clinicName}</strong>. Defina a senha da conta{" "}
          <strong>{email}</strong> para continuar.
        </p>
      </div>

      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.newPassword) || undefined}>
          <FieldLabel htmlFor="invite-new-password">Senha</FieldLabel>
          <Input
            id="invite-new-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.newPassword) || undefined}
            disabled={setPassword.isPending}
            {...register("newPassword")}
          />
          <FieldError errors={[errors.newPassword]} />
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword) || undefined}>
          <FieldLabel htmlFor="invite-confirm-password">
            Confirmar senha
          </FieldLabel>
          <Input
            id="invite-confirm-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword) || undefined}
            disabled={setPassword.isPending}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={setPassword.isPending}>
        {setPassword.isPending ? <Spinner /> : null}
        Salvar e continuar
      </Button>
    </form>
  )
}
