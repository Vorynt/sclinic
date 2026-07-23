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
    formState: { errors },
  } = useForm<InviteMemberValues, unknown, InviteMemberOutput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      roleKey: "receptionist",
    },
  })

  const invite = useInviteMemberMutation({
    onSuccess: () => {
      toast.success("Convite enviado por e-mail.")
      reset({
        name: "",
        email: "",
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
            Informe nome, e-mail e cargo. A pessoa receberá um link para criar a
            própria senha e aceitar o convite.
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
