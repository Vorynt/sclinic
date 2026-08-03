"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
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
import { routes } from "@/config/routes"
import { useResetPasswordMutation } from "@/modules/authentication/hooks/use-auth"
import { resetPasswordFormSchema } from "@/modules/authentication/schemas/auth.schema"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

type ResetPasswordValues = z.input<typeof resetPasswordFormSchema>
type ResetPasswordOutput = z.output<typeof resetPasswordFormSchema>

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues, unknown, ResetPasswordOutput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
  })

  const resetPassword = useResetPasswordMutation({
    onSuccess: () => {
      toast.success("Senha redefinida. Faça login com a nova senha.")
      router.replace(routes.login)
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

  if (!token) {
    return (
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Link inválido
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Este link de redefinição está incompleto ou expirou. Solicite um
            novo.
          </p>
        </div>
        <Button size="lg" className="w-full" asChild>
          <Link href={routes.forgotPassword}>Solicitar novo link</Link>
        </Button>
      </div>
    )
  }

  const onSubmit = handleSubmit((data) => {
    setFormError(null)
    resetPassword.mutate({
      token: data.token,
      newPassword: data.newPassword,
    })
  })

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-8"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Redefinir senha
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Escolha uma nova senha para a sua conta.
        </p>
      </div>

      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <input type="hidden" {...register("token")} />

      <FieldGroup className="gap-5">
        <Field data-invalid={Boolean(errors.newPassword)}>
          <FieldLabel htmlFor="reset-new-password">Nova senha</FieldLabel>
          <Input
            id="reset-new-password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            aria-invalid={Boolean(errors.newPassword)}
            disabled={resetPassword.isPending}
            {...register("newPassword")}
          />
          <FieldError>{errors.newPassword?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="reset-confirm-password">
            Confirmar nova senha
          </FieldLabel>
          <Input
            id="reset-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            aria-invalid={Boolean(errors.confirmPassword)}
            disabled={resetPassword.isPending}
            {...register("confirmPassword")}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={resetPassword.isPending}
      >
        {resetPassword.isPending ? (
          <>
            <Spinner />
            Salvando…
          </>
        ) : (
          "Salvar nova senha"
        )}
      </Button>
    </form>
  )
}
