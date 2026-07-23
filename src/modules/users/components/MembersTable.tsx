"use client"

import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  type AssignableRoleKey,
  getRoleLabel,
  getTeamStatusLabel,
  type TeamRowStatus,
  USERS_CONSTANTS,
} from "@/modules/users/constants/users"
import {
  useRevokeInvitationMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberStatusMutation,
} from "@/modules/users/hooks/use-user-mutations"
import {
  useAssignableRolesQuery,
  useInvitationsQuery,
  useMembersQuery,
} from "@/modules/users/hooks/use-users"
import { useAuth } from "@/providers/AuthProvider"
import { ArrowsClockwiseIcon, ProhibitIcon } from "@phosphor-icons/react"

function statusBadgeVariant(
  status: TeamRowStatus,
): "secondary" | "outline" {
  return status === "active" ? "secondary" : "outline"
}

export function MembersTable() {
  const { auth } = useAuth()
  const membersQuery = useMembersQuery()
  const invitationsQuery = useInvitationsQuery()
  const rolesQuery = useAssignableRolesQuery()

  const updateRole = useUpdateMemberRoleMutation({
    onSuccess: () => toast.success("Papel atualizado"),
    onError: (error) => toast.error(error.message),
  })

  const updateStatus = useUpdateMemberStatusMutation({
    onSuccess: (member) =>
      toast.success(
        member.status === "suspended" ? "Membro suspenso" : "Membro reativado",
      ),
    onError: (error) => toast.error(error.message),
  })

  const revokeInvite = useRevokeInvitationMutation({
    onSuccess: () => toast.success("Convite cancelado"),
    onError: (error) => toast.error(error.message),
  })

  if (membersQuery.isLoading || invitationsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (membersQuery.isError || invitationsQuery.isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar a equipe.
      </p>
    )
  }

  const members = membersQuery.data ?? []
  const invitations = invitationsQuery.data ?? []

  if (members.length === 0 && invitations.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Nenhum membro</EmptyTitle>
          <EmptyDescription>
            Convide colaboradores para começar a montar a equipe.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const isSelf = member.userId === auth?.user.id
          const isOwner = member.roleKey === USERS_CONSTANTS.OWNER_ROLE_KEY
          const canManage = !isSelf && !isOwner
          const status: TeamRowStatus =
            member.status === "suspended" ? "suspended" : "active"

          return (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.userName}</TableCell>
              <TableCell>{member.userEmail}</TableCell>
              <TableCell>
                {canManage ? (
                  <Select
                    value={member.roleKey}
                    onValueChange={(roleKey) =>
                      updateRole.mutate({
                        membershipId: member.id,
                        roleKey: roleKey as AssignableRoleKey,
                      })
                    }
                    disabled={updateRole.isPending}
                  >
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(rolesQuery.data ?? []).map((role) => (
                        <SelectItem key={role.id} value={role.key}>
                          {getRoleLabel(role.key, role.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  getRoleLabel(member.roleKey, member.roleName)
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant(status)}>
                  {getTeamStatusLabel(status)}
                </Badge>
              </TableCell>
              <TableCell className="flex items-end justify-end text-right">
                {canManage ? (
                  <ButtonGroup>
                    <Button
                      type="button"
                      variant={status === "suspended" ? "outline" : "destructive"}
                      size="icon"
                      tooltip={
                        status === "suspended" ? "Reativar" : "Suspender"
                      }
                      disabled={updateStatus.isPending}
                      onClick={() =>
                        updateStatus.mutate({
                          membershipId: member.id,
                          status:
                            status === "suspended" ? "active" : "suspended",
                        })
                      }
                    >
                      {status === "suspended" ? (
                        <ArrowsClockwiseIcon />
                      ) : (
                        <ProhibitIcon />
                      )}
                      <span className="sr-only">
                        {status === "suspended" ? "Reativar" : "Suspender"}
                      </span>
                    </Button>
                  </ButtonGroup>
                ) : null}
              </TableCell>
            </TableRow>
          )
        })}

        {invitations.map((invitation) => (
          <TableRow key={`invite-${invitation.id}`}>
            <TableCell className="text-muted-foreground">—</TableCell>
            <TableCell className="font-medium">{invitation.email}</TableCell>
            <TableCell>
              {getRoleLabel(invitation.roleKey, invitation.roleName)}
            </TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant("invite_pending")}>
                {getTeamStatusLabel("invite_pending")}
              </Badge>
            </TableCell>
            <TableCell className="flex items-end justify-end text-right">
              <ButtonGroup>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  tooltip="Cancelar convite"
                  disabled={revokeInvite.isPending}
                  onClick={() =>
                    revokeInvite.mutate({ invitationId: invitation.id })
                  }
                >
                  <ProhibitIcon />
                  <span className="sr-only">Cancelar convite</span>
                </Button>
              </ButtonGroup>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
