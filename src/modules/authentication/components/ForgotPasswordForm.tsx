"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
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
import { useRequestPasswordResetMutation } from "@/modules/authentication/hooks/use-auth"
import { requestPasswordResetSchema } from "@/modules/authentication/schemas/auth.schema"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

type ForgotPasswordValues = z.input<typeof requestPasswordResetSchema>
type ForgotPasswordOutput = z.output<typeof requestPasswordResetSchema>

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues, unknown, ForgotPasswordOutput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  })

  const requestReset = useRequestPasswordResetMutation({
    onSuccess: () => {
      setSubmitted(true)
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
    requestReset.mutate({
      email: data.email,
      redirectTo: `${window.location.origin}${routes.resetPassword}`,
    })
  })

  if (submitted) {
    return (
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Verifique seu e-mail
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Se existir uma conta com esse e-mail, enviamos um link para
            redefinir a senha. Confira também a pasta de spam.
          </p>
        </div>
        <Button variant="outline" size="lg" className="w-full" asChild>
          <Link href={routes.login}>Voltar ao login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-8"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Recuperar senha
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Informe o e-mail da conta. Enviaremos um link seguro para redefinir a
          senha.
        </p>
      </div>

      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="gap-5">
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="forgot-email">E-mail</FieldLabel>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="voce@clinica.com"
            aria-invalid={Boolean(errors.email)}
            disabled={requestReset.isPending}
            {...register("email")}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={requestReset.isPending}
        >
          {requestReset.isPending ? (
            <>
              <Spinner />
              Enviando…
            </>
          ) : (
            "Enviar link"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href={routes.login}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Voltar ao login
          </Link>
        </p>
      </div>
    </form>
  )
}
