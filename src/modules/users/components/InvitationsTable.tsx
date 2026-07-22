"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getRoleLabel } from "@/modules/users/constants/users"
import { useRevokeInvitationMutation } from "@/modules/users/hooks/use-user-mutations"
import { useInvitationsQuery } from "@/modules/users/hooks/use-users"

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

export function InvitationsTable() {
  const invitationsQuery = useInvitationsQuery()
  const revoke = useRevokeInvitationMutation({
    onSuccess: () => toast.success("Convite cancelado"),
    onError: (error) => toast.error(error.message),
  })

  if (invitationsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (invitationsQuery.isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os convites.
      </p>
    )
  }

  const invitations = invitationsQuery.data ?? []

  if (invitations.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Nenhum convite pendente</EmptyTitle>
          <EmptyDescription>
            Convites enviados e ainda não aceitos aparecem aqui.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>E-mail</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Expira em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell className="font-medium">{invitation.email}</TableCell>
            <TableCell>
              {getRoleLabel(invitation.roleKey, invitation.roleName)}
            </TableCell>
            <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={revoke.isPending}
                onClick={() =>
                  revoke.mutate({ invitationId: invitation.id })
                }
              >
                Cancelar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
