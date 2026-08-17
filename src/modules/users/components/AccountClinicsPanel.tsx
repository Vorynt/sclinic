"use client"

import {
  ArrowRightIcon,
  SignOutIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { QueryErrorState } from "@/components/status/QueryErrorState"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FormErrorAlert } from "@/components/ui/form-error-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { useSwitchClinicMutation } from "@/modules/authentication/hooks/use-auth"
import { useDeleteClinicMutation } from "@/modules/clinics/hooks/use-clinic-settings"
import { CreateOwnedClinicCta } from "@/modules/users/components/CreateOwnedClinicCta"
import { USERS_CONSTANTS } from "@/modules/users/constants/users"
import { useAccountOverview } from "@/modules/users/hooks/use-account"
import { useLeaveOwnClinicMutation } from "@/modules/users/hooks/use-account-mutations"
import { accountQueryKeys } from "@/modules/users/queries/account.query"
import type { AccountMembershipSummary } from "@/modules/users/types/account"
import {
  ErrorCode,
  getClientMessage,
  isAppError,
} from "@/shared/errors"

function membershipStatusLabel(status: AccountMembershipSummary["status"]) {
  switch (status) {
    case "active":
      return "Ativa"
    case "suspended":
      return "Suspensa"
    case "invited":
      return "Convidada"
    case "removed":
      return "Removida"
    default:
      return status
  }
}

function hasActiveOwnedClinic(
  memberships: AccountMembershipSummary[],
): boolean {
  return memberships.some(
    (membership) =>
      membership.roleKey === USERS_CONSTANTS.OWNER_ROLE_KEY &&
      membership.status === "active",
  )
}

function isOwner(membership: AccountMembershipSummary): boolean {
  return membership.roleKey === USERS_CONSTANTS.OWNER_ROLE_KEY
}

export function AccountClinicsPanel() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch, isFetching } = useAccountOverview()

  const [pendingClinicId, setPendingClinicId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] =
    useState<AccountMembershipSummary | null>(null)
  const [leaveTarget, setLeaveTarget] =
    useState<AccountMembershipSummary | null>(null)
  const [confirmationName, setConfirmationName] = useState("")
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const switchClinic = useSwitchClinicMutation({
    onSuccess: () => {
      toast.success("Clínica selecionada")
      router.replace(routes.home)
    },
    onError: (error) => {
      setPendingClinicId(null)
      toast.error(error.message)
    },
  })

  const deleteClinic = useDeleteClinicMutation({
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: accountQueryKeys.all })
      toast.success("Clínica excluída")
      setDeleteTarget(null)
      setConfirmationName("")
      setFormError(null)
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

  const leaveClinic = useLeaveOwnClinicMutation({
    onSuccess: () => {
      toast.success("Você saiu da clínica")
      setLeaveTarget(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Carregando clínicas…
      </div>
    )
  }

  if (isError || !data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar as clínicas da conta."
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  const showCreateClinicCta = !hasActiveOwnedClinic(data.memberships)
  const nameMatches =
    Boolean(deleteTarget) &&
    confirmationName.trim() === deleteTarget?.clinicName

  return (
    <div className="flex flex-col gap-6">
      {data.memberships.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma clínica vinculada a esta conta.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.memberships.map((membership) => {
            const owner = isOwner(membership)
            const canAccess =
              membership.status === "active" &&
              membership.isEntitled &&
              !membership.isCurrent
            const switching =
              switchClinic.isPending && pendingClinicId === membership.clinicId

            return (
              <li
                key={membership.clinicId}
                className="flex flex-col gap-3 rounded-md border border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {membership.clinicName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {membership.roleName}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {membership.isCurrent ? (
                      <Badge variant="secondary">Atual</Badge>
                    ) : null}
                    {membership.isDefault ? (
                      <Badge variant="outline">Padrão</Badge>
                    ) : null}
                    <Badge
                      variant={
                        membership.status === "active" ? "outline" : "destructive"
                      }
                    >
                      {membershipStatusLabel(membership.status)}
                    </Badge>
                    {!membership.isEntitled ? (
                      <Badge variant="destructive">Sem assinatura</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {canAccess ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={switchClinic.isPending}
                      onClick={() => {
                        setPendingClinicId(membership.clinicId)
                        switchClinic.mutate({ clinicId: membership.clinicId })
                      }}
                    >
                      {switching ? (
                        <Spinner data-icon="inline-start" />
                      ) : (
                        <ArrowRightIcon data-icon="inline-start" />
                      )}
                      Acessar
                    </Button>
                  ) : null}

                  {owner ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setFormError(null)
                        setConfirmationName("")
                        setDeleteTarget(membership)
                      }}
                    >
                      <TrashIcon data-icon="inline-start" />
                      Excluir
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={leaveClinic.isPending}
                      onClick={() => setLeaveTarget(membership)}
                    >
                      <SignOutIcon data-icon="inline-start" />
                      Sair
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {showCreateClinicCta ? (
        <CreateOwnedClinicCta
          emphasis={data.memberships.length === 0 ? "primary" : "default"}
        />
      ) : null}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (deleteClinic.isPending) return
          if (!open) {
            setDeleteTarget(null)
            setConfirmationName("")
            setFormError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir “{deleteTarget?.clinicName}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados da clínica ficarão inacessíveis e a assinatura será
              cancelada imediatamente. Para confirmar, digite o nome da clínica
              exatamente como aparece abaixo.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="account-clinic-delete-confirmation">
              Nome da clínica:{" "}
              <span className="font-medium">{deleteTarget?.clinicName}</span>
            </Label>
            <Input
              id="account-clinic-delete-confirmation"
              value={confirmationName}
              autoComplete="off"
              disabled={deleteClinic.isPending}
              placeholder={deleteTarget?.clinicName}
              onChange={(event) => setConfirmationName(event.target.value)}
            />
          </div>

          {formError ? <FormErrorAlert message={formError.message} /> : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteClinic.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!nameMatches || deleteClinic.isPending || !deleteTarget}
              onClick={(event) => {
                event.preventDefault()
                if (!deleteTarget) return
                setFormError(null)
                deleteClinic.mutate({
                  confirmationName: confirmationName.trim(),
                  clinicId: deleteTarget.clinicId,
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

      <AlertDialog
        open={Boolean(leaveTarget)}
        onOpenChange={(open) => {
          if (leaveClinic.isPending) return
          if (!open) setLeaveTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Sair de “{leaveTarget?.clinicName}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você perderá o acesso a esta clínica. Um administrador poderá
              convidá-lo novamente depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leaveClinic.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={leaveClinic.isPending || !leaveTarget}
              onClick={(event) => {
                event.preventDefault()
                if (!leaveTarget) return
                leaveClinic.mutate({ clinicId: leaveTarget.clinicId })
              }}
            >
              {leaveClinic.isPending ? (
                <>
                  <Spinner />
                  Saindo…
                </>
              ) : (
                "Sair da clínica"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
