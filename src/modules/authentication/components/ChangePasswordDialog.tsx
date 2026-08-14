"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useId } from "react"
import { Controller, useForm } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { FormErrorAlert } from "@/components/ui/form-error-alert"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { changePasswordSchema } from "@/modules/authentication/schemas/auth.schema"

type ChangePasswordValues = z.input<typeof changePasswordSchema>
type ChangePasswordOutput = z.output<typeof changePasswordSchema>

type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
  error?: { message: string } | null
  onConfirm: (data: ChangePasswordOutput) => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  isPending = false,
  error,
  onConfirm,
}: ChangePasswordDialogProps) {
  const currentId = useId()
  const newId = useId()
  const confirmId = useId()
  const revokeId = useId()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues, unknown, ChangePasswordOutput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: true,
    },
  })

  useEffect(() => {
    if (open) return
    reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: true,
    })
  }, [open, reset])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
          <DialogDescription>
            Informe a senha atual e defina uma nova. Você pode encerrar o acesso
            nos outros dispositivos.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onConfirm)}
          className="flex flex-col gap-4"
          noValidate
        >
          {error ? <FormErrorAlert message={error.message} /> : null}

          <FieldGroup className="flex flex-col gap-4">
            <Field data-invalid={Boolean(errors.currentPassword) || undefined}>
              <FieldLabel htmlFor={currentId}>Senha atual</FieldLabel>
              <Input
                id={currentId}
                type="password"
                autoComplete="current-password"
                autoFocus
                disabled={isPending}
                aria-invalid={Boolean(errors.currentPassword) || undefined}
                {...register("currentPassword")}
              />
              <FieldError>{errors.currentPassword?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.newPassword) || undefined}>
              <FieldLabel htmlFor={newId}>Nova senha</FieldLabel>
              <Input
                id={newId}
                type="password"
                autoComplete="new-password"
                disabled={isPending}
                aria-invalid={Boolean(errors.newPassword) || undefined}
                {...register("newPassword")}
              />
              <FieldError>{errors.newPassword?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.confirmPassword) || undefined}>
              <FieldLabel htmlFor={confirmId}>Confirmar nova senha</FieldLabel>
              <Input
                id={confirmId}
                type="password"
                autoComplete="new-password"
                disabled={isPending}
                aria-invalid={Boolean(errors.confirmPassword) || undefined}
                {...register("confirmPassword")}
              />
              <FieldError>{errors.confirmPassword?.message}</FieldError>
            </Field>

            <Field orientation="horizontal">
              <Controller
                name="revokeOtherSessions"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={revokeId}
                    checked={field.value === true}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true)
                    }}
                    disabled={isPending}
                  />
                )}
              />
              <FieldContent>
                <FieldLabel
                  htmlFor={revokeId}
                  className="font-normal leading-snug text-muted-foreground"
                >
                  Encerrar sessões em outros dispositivos
                </FieldLabel>
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : null}
              Atualizar senha
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
