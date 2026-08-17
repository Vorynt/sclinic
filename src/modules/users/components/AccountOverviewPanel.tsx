"use client"

import Link from "next/link"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { CreateOwnedClinicCta } from "@/modules/users/components/CreateOwnedClinicCta"
import { USERS_CONSTANTS } from "@/modules/users/constants/users"
import { useAccountOverview } from "@/modules/users/hooks/use-account"
import type { AccountMembershipSummary } from "@/modules/users/types/account"
import { formatDate } from "@/utils/date"

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
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

export function AccountOverviewPanel() {
  const { data, isPending, isError, refetch, isFetching } = useAccountOverview()

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Carregando conta…
      </div>
    )
  }

  if (isError || !data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar os dados da conta."
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  const showCreateClinicCta = !hasActiveOwnedClinic(data.memberships)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-4">
        <Avatar size="lg">
          {data.image ? (
            <AvatarImage src={data.image} alt={data.name} />
          ) : null}
          <AvatarFallback>{initialsFromName(data.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex flex-col gap-1">
          <p className="truncate text-base font-medium text-foreground">
            {data.name}
          </p>
          <p className="truncate text-sm text-muted-foreground">{data.email}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant={data.emailVerified ? "secondary" : "outline"}>
              {data.emailVerified ? "E-mail verificado" : "E-mail não verificado"}
            </Badge>
            {data.phone ? (
              <Badge variant="outline">{data.phone}</Badge>
            ) : null}
          </div>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Conta criada em
          </dt>
          <dd className="text-sm text-foreground">
            {formatDate(data.createdAt)}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Último acesso
          </dt>
          <dd className="text-sm text-foreground">
            {data.lastLoginAt
              ? formatDate(data.lastLoginAt, "dd/MM/yyyy HH:mm")
              : "—"}
          </dd>
        </div>
      </dl>

      <Separator />

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-foreground">
          Clínicas vinculadas
        </h3>
        {data.memberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma clínica vinculada a esta conta.
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {data.memberships.length === 1
                ? "1 clínica vinculada a esta conta."
                : `${data.memberships.length} clínicas vinculadas a esta conta.`}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href={routes.accountClinics}>Gerenciar clínicas</Link>
            </Button>
          </div>
        )}

        {showCreateClinicCta ? (
          <CreateOwnedClinicCta
            emphasis={data.memberships.length === 0 ? "primary" : "default"}
          />
        ) : null}
      </div>
    </div>
  )
}
