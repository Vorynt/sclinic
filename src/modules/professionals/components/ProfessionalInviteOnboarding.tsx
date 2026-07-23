"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { routes } from "@/config/routes"
import { authQueryKeys } from "@/modules/authentication/queries/auth.query"
import {
  BRAZILIAN_STATES,
  COUNCIL_TYPE_LABELS,
  getAffiliationTypeLabel,
} from "@/modules/professionals/constants/professionals"
import {
  useAcceptProfessionalInviteMutation,
  useProfessionalInvitePreviewQuery,
  useUpdateProfessionalInviteProfileMutation,
} from "@/modules/professionals/hooks/use-professional-invite"
import { updateProfessionalInviteProfileSchema } from "@/modules/professionals/schemas/professional.schema"
import { SetInvitePasswordForm } from "@/modules/users/components/SetInvitePasswordForm"
import { useInviteAccessQuery } from "@/modules/users/hooks/use-users"
import { useAuth } from "@/providers/AuthProvider"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

type InviteProfileValues = z.input<typeof updateProfessionalInviteProfileSchema>
type InviteProfileOutput = z.output<
  typeof updateProfessionalInviteProfileSchema
>

type ProfessionalInviteOnboardingProps = {
  token: string
}

export function ProfessionalInviteOnboarding({
  token,
}: ProfessionalInviteOnboardingProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { auth, isLoading, isAuthenticated } = useAuth()
  const pendingActionRef = useRef<"save" | "accept" | null>(null)
  const [pendingAction, setPendingAction] = useState<"save" | "accept" | null>(
    null,
  )
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)
  const [defaultsReady, setDefaultsReady] = useState(false)

  const invitePath = `${routes.professionalInvite}?token=${token}`
  const loginHref = `${routes.login}?next=${encodeURIComponent(invitePath)}`

  const needsAccessLookup =
    !isLoading && (!isAuthenticated || Boolean(auth?.user.mustChangePassword))
  const accessQuery = useInviteAccessQuery(needsAccessLookup ? token : "")

  const previewQuery = useProfessionalInvitePreviewQuery(
    isAuthenticated && auth && !auth.user.mustChangePassword ? token : "",
  )

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteProfileValues, unknown, InviteProfileOutput>({
    resolver: zodResolver(updateProfessionalInviteProfileSchema),
    defaultValues: {
      token,
      fullName: "",
      councilType: undefined,
      councilNumber: "",
      councilState: "",
      specialty: "",
      biography: "",
    },
  })

  useEffect(() => {
    if (!previewQuery.data || defaultsReady) return

    reset({
      token,
      fullName: previewQuery.data.fullName ?? "",
      councilType:
        (previewQuery.data.councilType as InviteProfileValues["councilType"]) ??
        undefined,
      councilNumber: previewQuery.data.councilNumber ?? "",
      councilState: previewQuery.data.councilState ?? "",
      specialty: previewQuery.data.specialty ?? "",
      biography: previewQuery.data.biography ?? "",
    })
    setDefaultsReady(true)
  }, [defaultsReady, previewQuery.data, reset, token])

  function handleError(error: unknown) {
    if (isAppError(error)) {
      setFormError({ message: error.message, code: error.code })
      toast.error(error.message)
      return
    }
    setFormError({
      message: getClientMessage(ErrorCode.INTERNAL_ERROR),
      code: ErrorCode.INTERNAL_ERROR,
    })
    toast.error(getClientMessage(ErrorCode.INTERNAL_ERROR))
  }

  const acceptInvite = useAcceptProfessionalInviteMutation({
    onSuccess: async () => {
      pendingActionRef.current = null
      setPendingAction(null)
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
      toast.success("Convite aceito")
      router.push(routes.home)
    },
    onError: (error) => {
      pendingActionRef.current = null
      setPendingAction(null)
      handleError(error)
    },
  })

  const updateProfile = useUpdateProfessionalInviteProfileMutation({
    onSuccess: () => {
      setFormError(null)
      if (pendingActionRef.current === "accept") {
        acceptInvite.mutate({ token })
        return
      }
      pendingActionRef.current = null
      setPendingAction(null)
      toast.success("Dados salvos")
    },
    onError: (error) => {
      pendingActionRef.current = null
      setPendingAction(null)
      handleError(error)
    },
  })

  const isPending = updateProfile.isPending || acceptInvite.isPending

  if (isLoading || (needsAccessLookup && accessQuery.isLoading)) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner className="size-6" />
        <p className="text-sm text-muted-foreground">Verificando sua sessão…</p>
      </div>
    )
  }

  if (needsAccessLookup && (accessQuery.isError || !accessQuery.data)) {
    return (
      <div className="flex max-w-sm flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Convite inválido
        </h1>
        <p className="text-sm text-muted-foreground">
          Não foi possível validar este convite. Peça um novo link à clínica.
        </p>
      </div>
    )
  }

  if (!isAuthenticated && accessQuery.data) {
    if (accessQuery.data.needsPasswordSetup) {
      return (
        <SetInvitePasswordForm
          token={token}
          email={accessQuery.data.email}
          clinicName={accessQuery.data.clinicName}
        />
      )
    }

    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Convite profissional
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com a conta <strong>{accessQuery.data.email}</strong> para
            revisar seus dados e aceitar o convite de{" "}
            <strong>{accessQuery.data.clinicName}</strong>.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button asChild>
            <a href={loginHref}>Entrar</a>
          </Button>
        </div>
      </div>
    )
  }

  if (auth?.user.mustChangePassword && accessQuery.data) {
    if (
      accessQuery.data.email.toLowerCase() !== auth.user.email.toLowerCase()
    ) {
      return (
        <div className="flex max-w-sm flex-col gap-2 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Conta diferente
          </h1>
          <p className="text-sm text-muted-foreground">
            Este convite é para <strong>{accessQuery.data.email}</strong>. Saia
            da conta atual e abra o link novamente.
          </p>
        </div>
      )
    }

    return (
      <SetInvitePasswordForm
        token={token}
        email={accessQuery.data.email}
        clinicName={accessQuery.data.clinicName}
      />
    )
  }

  if (previewQuery.isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner className="size-6" />
        <p className="text-sm text-muted-foreground">
          Carregando dados do convite…
        </p>
      </div>
    )
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <div className="flex max-w-sm flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Convite inválido
        </h1>
        <p className="text-sm text-muted-foreground">
          Não foi possível validar este convite. Peça um novo link à clínica.
        </p>
      </div>
    )
  }

  const preview = previewQuery.data

  const onSave = handleSubmit((data) => {
    setFormError(null)
    pendingActionRef.current = "save"
    setPendingAction("save")
    updateProfile.mutate(data)
  })

  const onAccept = handleSubmit((data) => {
    setFormError(null)
    pendingActionRef.current = "accept"
    setPendingAction("accept")
    updateProfile.mutate(data)
  })

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Complete seu perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Convite para <strong>{preview.clinicName}</strong> como{" "}
          {preview.roleName}
          {preview.affiliationType
            ? ` (${getAffiliationTypeLabel(preview.affiliationType)})`
            : ""}
          .
        </p>
      </div>

      <form className="flex flex-col gap-4" noValidate>
        {formError ? (
          <FormErrorAlert message={formError.message} code={formError.code} />
        ) : null}

        <FieldGroup className="flex flex-col gap-4">
          <Field data-invalid={Boolean(errors.fullName) || undefined}>
            <FieldLabel htmlFor="invite-full-name">Nome completo</FieldLabel>
            <Input
              id="invite-full-name"
              autoComplete="name"
              placeholder="Nome completo"
              aria-invalid={Boolean(errors.fullName) || undefined}
              disabled={isPending}
              {...register("fullName")}
            />
            <FieldError errors={[errors.fullName]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field data-invalid={Boolean(errors.councilType) || undefined}>
              <FieldLabel>Conselho</FieldLabel>
              <Controller
                name="councilType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      aria-invalid={Boolean(errors.councilType) || undefined}
                    >
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COUNCIL_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.councilType]} />
            </Field>

            <Field data-invalid={Boolean(errors.councilNumber) || undefined}>
              <FieldLabel htmlFor="invite-council-number">Número</FieldLabel>
              <Input
                id="invite-council-number"
                placeholder="Registro"
                aria-invalid={Boolean(errors.councilNumber) || undefined}
                disabled={isPending}
                {...register("councilNumber")}
              />
              <FieldError errors={[errors.councilNumber]} />
            </Field>

            <Field data-invalid={Boolean(errors.councilState) || undefined}>
              <FieldLabel>UF</FieldLabel>
              <Controller
                name="councilState"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      aria-invalid={Boolean(errors.councilState) || undefined}
                    >
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.councilState]} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.specialty) || undefined}>
            <FieldLabel htmlFor="invite-specialty">Especialidade</FieldLabel>
            <Input
              id="invite-specialty"
              placeholder="Ex.: Clínica geral"
              aria-invalid={Boolean(errors.specialty) || undefined}
              disabled={isPending}
              {...register("specialty")}
            />
            <FieldError errors={[errors.specialty]} />
          </Field>

          <Field data-invalid={Boolean(errors.biography) || undefined}>
            <FieldLabel htmlFor="invite-biography">Biografia</FieldLabel>
            <Textarea
              id="invite-biography"
              placeholder="Breve descrição profissional"
              aria-invalid={Boolean(errors.biography) || undefined}
              disabled={isPending}
              {...register("biography")}
            />
            <FieldError errors={[errors.biography]} />
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onSave}
          >
            {pendingAction === "save" && isPending ? <Spinner /> : null}
            Salvar dados
          </Button>
          <Button type="button" disabled={isPending} onClick={onAccept}>
            {pendingAction === "accept" && isPending ? <Spinner /> : null}
            Aceitar e entrar na clínica
          </Button>
        </div>
      </form>
    </div>
  )
}
