"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { FormErrorAlert } from "@/components/ui/form-error-alert"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { getRoleLabel } from "@/modules/users/constants/users"
import { useInviteMemberMutation } from "@/modules/users/hooks/use-user-mutations"
import { useAssignableRolesQuery } from "@/modules/users/hooks/use-users"
import { inviteMemberSchema } from "@/modules/users/schemas/invitation.schema"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

type InviteMemberValues = z.input<typeof inviteMemberSchema>
type InviteMemberOutput = z.output<typeof inviteMemberSchema>

function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")
}

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const rolesQuery = useAssignableRolesQuery()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InviteMemberValues, unknown, InviteMemberOutput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      temporaryPassword: "",
      roleKey: "receptionist",
    },
  })

  const invite = useInviteMemberMutation({
    onSuccess: () => {
      toast.success(
        "Convite enviado. Comunique a senha provisória ao colaborador.",
      )
      reset({
        name: "",
        email: "",
        temporaryPassword: "",
        roleKey: "receptionist",
      })
      setFormError(null)
      setOpen(false)
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
    invite.mutate(data)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setFormError(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">Convidar colaborador</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Convidar colaborador</DialogTitle>
          <DialogDescription>
            Defina nome, e-mail, senha provisória e cargo. A senha não é enviada
            no e-mail — compartilhe com o colaborador por um canal seguro.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {formError ? (
            <FormErrorAlert message={formError.message} code={formError.code} />
          ) : null}

          <FieldGroup className="flex flex-col gap-4">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="invite-name">Nome</FieldLabel>
              <Input
                id="invite-name"
                autoComplete="name"
                placeholder="Nome completo"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="invite-email">E-mail</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                placeholder="nome@clinica.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.temporaryPassword)}>
              <FieldLabel htmlFor="invite-password">Senha provisória</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="invite-password"
                  type="text"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  aria-invalid={Boolean(errors.temporaryPassword)}
                  {...register("temporaryPassword")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setValue("temporaryPassword", generateTemporaryPassword(), {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  Gerar
                </Button>
              </div>
              <FieldError>{errors.temporaryPassword?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.roleKey)}>
              <FieldLabel>Cargo</FieldLabel>
              <Controller
                name="roleKey"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={Boolean(errors.roleKey)}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {(rolesQuery.data ?? []).map((role) => (
                        <SelectItem key={role.id} value={role.key}>
                          {getRoleLabel(role.key, role.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.roleKey?.message}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={invite.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? <Spinner /> : null}
              Enviar convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
