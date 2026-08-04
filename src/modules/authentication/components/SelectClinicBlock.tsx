"use client"

import {
  BuildingsIcon,
  CreditCardIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FormErrorAlert } from "@/components/ui/form-error-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { useSwitchClinicMutation } from "@/modules/authentication/hooks/use-auth"
import { getSafeNextPath } from "@/modules/authentication/utils/post-auth-redirect"
import { useDeleteClinicMutation } from "@/modules/clinics/hooks/use-clinic-settings"
import type { ClinicSubscriptionStatus } from "@/modules/clinics/types/clinic"
import {
  ErrorCode,
  getClientMessage,
  isAppError,
} from "@/shared/errors"

type SelectableClinic = {
  clinicId: string
  name: string
  roleName: string
  status: "active" | "suspended"
  suspendReason?: "membership" | "subscription"
}

type BlockedClinic = {
  clinicId: string
  clinicName: string
  isOwner: boolean
  subscriptionStatus?: ClinicSubscriptionStatus
}

type SelectClinicBlockProps = {
  clinics: SelectableClinic[]
  next?: string | null
  blockedClinic?: BlockedClinic | null
}

function blockedTitle(status?: ClinicSubscriptionStatus): string {
  switch (status) {
    case "past_due":
      return "Pagamento pendente"
    case "unpaid":
      return "Assinatura inadimplente"
    case "canceled":
      return "Assinatura cancelada"
    case "incomplete":
      return "Assinatura incompleta"
    default:
      return "Acesso bloqueado pela assinatura"
  }
}

function blockedDescription(
  clinicName: string,
  isOwner: boolean,
  status?: ClinicSubscriptionStatus,
): string {
  const clinic = clinicName
  if (status === "unpaid") {
    return isOwner
      ? `A clínica ${clinic} está inadimplente. Regularize o pagamento para voltar a usar o sistema, ou exclua a clínica.`
      : `A clínica ${clinic} está inadimplente. Peça ao proprietário para regularizar, ou escolha outra clínica.`
  }
  if (status === "canceled") {
    return isOwner
      ? `A assinatura da clínica ${clinic} foi cancelada. Reative para voltar a usar, ou exclua a clínica.`
      : `A assinatura da clínica ${clinic} foi cancelada. Peça ao proprietário para reativar, ou escolha outra clínica.`
  }
  return isOwner
    ? `A clínica ${clinic} está sem acesso ativo pela assinatura. Regularize para voltar a usar o sistema.`
    : `A clínica ${clinic} está sem acesso ativo pela assinatura. Peça ao proprietário para regularizar, ou escolha outra clínica.`
}

export function SelectClinicBlock({
  clinics,
  next,
  blockedClinic = null,
}: SelectClinicBlockProps) {
  const router = useRouter()
  const safeNext = getSafeNextPath(next)
  const [pendingClinicId, setPendingClinicId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmationName, setConfirmationName] = useState("")
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const switchClinic = useSwitchClinicMutation({
    onSuccess: () => {
      toast.success("Clínica selecionada")
      router.replace(safeNext ?? routes.home)
    },
    onError: (error) => {
      setPendingClinicId(null)
      toast.error(error.message)
    },
  })

  const deleteClinic = useDeleteClinicMutation({
    onSuccess: (result) => {
      toast.success("Clínica excluída")
      setDeleteOpen(false)
      router.replace(result.redirectTo)
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

  const activeClinics = clinics.filter((clinic) => clinic.status === "active")
  const suspendedClinics = clinics.filter(
    (clinic) => clinic.status === "suspended",
  )

  const hasSelectable = activeClinics.length > 0
  const nameMatches =
    Boolean(blockedClinic) &&
    confirmationName.trim() === blockedClinic?.clinicName

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BuildingsIcon className="size-6" weight="duotone" aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Escolha a clínica
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasSelectable
              ? "Selecione com qual clínica deseja continuar."
              : "Nenhuma clínica disponível no momento."}
          </p>
        </div>
      </div>

      {blockedClinic ? (
        <Alert variant="destructive">
          <WarningCircleIcon />
          <AlertTitle>
            {blockedTitle(blockedClinic.subscriptionStatus)}
          </AlertTitle>
          <AlertDescription>
            {blockedDescription(
              blockedClinic.clinicName,
              blockedClinic.isOwner,
              blockedClinic.subscriptionStatus,
            )}
          </AlertDescription>
        </Alert>
      ) : null}

      {blockedClinic?.isOwner ? (
        <div className="flex flex-col gap-2">
          <Button asChild size="lg" className="w-full">
            <Link href={routes.accountSubscription}>
              <CreditCardIcon data-icon="inline-start" />
              Regularizar assinatura
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => {
              setFormError(null)
              setConfirmationName("")
              setDeleteOpen(true)
            }}
          >
            <TrashIcon data-icon="inline-start" />
            Excluir clínica
          </Button>
        </div>
      ) : null}

      {activeClinics.length > 0 || suspendedClinics.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {activeClinics.map((clinic) => {
            const isPending =
              switchClinic.isPending && pendingClinicId === clinic.clinicId

            return (
              <li key={clinic.clinicId}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
                  disabled={switchClinic.isPending}
                  onClick={() => {
                    setPendingClinicId(clinic.clinicId)
                    switchClinic.mutate({ clinicId: clinic.clinicId })
                  }}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {isPending ? (
                      <Spinner className="size-4" />
                    ) : (
                      <BuildingsIcon className="size-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {clinic.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {clinic.roleName}
                    </span>
                  </span>
                </Button>
              </li>
            )
          })}

          {suspendedClinics.map((clinic) => (
            <li key={clinic.clinicId}>
              <div
                className="flex h-auto w-full items-start gap-3 rounded-lg border border-border/70 px-3 py-3 text-left opacity-60"
                title={
                  clinic.suspendReason === "subscription"
                    ? "Sem acesso pela assinatura"
                    : "Seu acesso a esta clínica está suspenso"
                }
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <BuildingsIcon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {clinic.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {clinic.suspendReason === "subscription"
                      ? "Sem acesso pela assinatura"
                      : "Suspenso"}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {blockedClinic?.isOwner ? (
        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            if (deleteClinic.isPending) return
            setDeleteOpen(open)
            if (!open) {
              setConfirmationName("")
              setFormError(null)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Excluir “{blockedClinic.clinicName}”?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Todos os dados da clínica ficarão inacessíveis e a assinatura
                será cancelada imediatamente. Para confirmar, digite o nome da
                clínica exatamente como aparece abaixo.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="select-clinic-delete-confirmation">
                Nome da clínica:{" "}
                <span className="font-medium">{blockedClinic.clinicName}</span>
              </Label>
              <Input
                id="select-clinic-delete-confirmation"
                value={confirmationName}
                autoComplete="off"
                disabled={deleteClinic.isPending}
                placeholder={blockedClinic.clinicName}
                onChange={(event) => setConfirmationName(event.target.value)}
              />
            </div>

            {formError ? (
              <FormErrorAlert
                message={formError.message}
              />
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteClinic.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!nameMatches || deleteClinic.isPending}
                onClick={(event) => {
                  event.preventDefault()
                  setFormError(null)
                  deleteClinic.mutate({
                    confirmationName: confirmationName.trim(),
                    clinicId: blockedClinic.clinicId,
                  })
                }}
              >
                {deleteClinic.isPending ? (
                  <>
                    <Spinner />
                    Excluindo…
                  </>
                ) : (
                  "Excluir definitivamente"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  )
}
