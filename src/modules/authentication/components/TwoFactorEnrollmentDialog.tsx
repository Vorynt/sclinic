"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import QRCode from "react-qr-code"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { FormErrorAlert } from "@/components/ui/form-error-alert"
import { Spinner } from "@/components/ui/spinner"
import {
  BackupCodesList,
  copyBackupCodes,
} from "@/modules/authentication/components/BackupCodesList"
import { TotpCodeInput } from "@/modules/authentication/components/TotpCodeInput"
import { useVerifyTwoFactorSetupMutation } from "@/modules/authentication/hooks/use-auth"
import { verifyTotpSchema } from "@/modules/authentication/schemas/auth.schema"
import type { TwoFactorEnableResult } from "@/modules/authentication/types/auth"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

type TotpValues = z.input<typeof verifyTotpSchema>
type TotpOutput = z.output<typeof verifyTotpSchema>

type TwoFactorEnrollmentDialogProps = {
  open: boolean
  enrollment: TwoFactorEnableResult | null
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export function TwoFactorEnrollmentDialog({
  open,
  enrollment,
  onOpenChange,
  onComplete,
}: TwoFactorEnrollmentDialogProps) {
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const form = useForm<TotpValues, unknown, TotpOutput>({
    resolver: zodResolver(verifyTotpSchema),
    defaultValues: { code: "" },
  })

  const verify = useVerifyTwoFactorSetupMutation({
    onSuccess: () => {
      toast.success("Autenticação em duas etapas ativada")
      onComplete()
    },
    onError: (error) => {
      if (isAppError(error)) {
        setFormError({
          message: getClientMessage(error.code),
          code: error.code,
        })
        return
      }
      setFormError({
        message: getClientMessage(ErrorCode.INTERNAL_ERROR),
        code: ErrorCode.INTERNAL_ERROR,
      })
    },
  })

  useEffect(() => {
    if (open) return
    form.reset({ code: "" })
    setFormError(null)
  }, [open, form])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (verify.isPending) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[min(90svh,44rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure o autenticador</DialogTitle>
          <DialogDescription>
            Escaneie o QR no app (Google Authenticator, Authy ou similar) e
            confirme o código. Guarde os códigos de backup — eles não aparecem
            de novo.
          </DialogDescription>
        </DialogHeader>

        {enrollment ? (
          <form
            onSubmit={form.handleSubmit((data) => {
              setFormError(null)
              verify.mutate(data)
            })}
            className="flex flex-col gap-4"
            noValidate
          >
            {formError ? (
              <FormErrorAlert message={formError.message} />
            ) : null}

            <div className="mx-auto w-fit rounded-xl bg-white p-3">
              <QRCode value={enrollment.totpURI} size={168} />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  Códigos de backup
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void copyBackupCodes(enrollment.backupCodes).then(() => {
                      toast.success("Códigos copiados")
                    })
                  }}
                >
                  Copiar
                </Button>
              </div>
              <BackupCodesList codes={enrollment.backupCodes} />
            </div>

            <FieldGroup>
              <Field
                data-invalid={
                  Boolean(form.formState.errors.code) || undefined
                }
              >
                <FieldLabel htmlFor="setup-2fa-code">Código do app</FieldLabel>
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TotpCodeInput
                      id="setup-2fa-code"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={verify.isPending}
                      invalid={fieldState.invalid}
                      autoFocus
                    />
                  )}
                />
                <FieldError>{form.formState.errors.code?.message}</FieldError>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={verify.isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={verify.isPending}>
                {verify.isPending ? <Spinner /> : null}
                Confirmar e ativar
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
