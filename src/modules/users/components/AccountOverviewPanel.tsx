"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useAccountOverview } from "@/modules/users/hooks/use-account"
import type { AccountMembershipSummary } from "@/modules/users/types/account"
import { formatDate } from "@/utils/date"

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
}

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

export function AccountOverviewPanel() {
  const { data, isPending, isError } = useAccountOverview()

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
      <p className="text-sm text-destructive">
        Não foi possível carregar os dados da conta.
      </p>
    )
  }

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
          <ul className="flex flex-col gap-2">
            {data.memberships.map((membership) => (
              <li
                key={membership.clinicId}
                className="flex flex-col gap-1 rounded-md border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {membership.clinicName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {membership.roleName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
