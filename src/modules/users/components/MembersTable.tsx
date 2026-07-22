"use client"

import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/providers/AuthProvider"
import { Skeleton } from "@/components/ui/skeleton"
import {
  type AssignableRoleKey,
  getRoleLabel,
  USERS_CONSTANTS,
} from "@/modules/users/constants/users"
import {
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from "@/modules/users/hooks/use-user-mutations"
import {
  useAssignableRolesQuery,
  useMembersQuery,
} from "@/modules/users/hooks/use-users"

function statusLabel(status: string) {
  if (status === "suspended") return "Suspenso"
  return "Ativo"
}

export function MembersTable() {
  const { auth } = useAuth()
  const membersQuery = useMembersQuery()
  const rolesQuery = useAssignableRolesQuery()

  const updateRole = useUpdateMemberRoleMutation({
    onSuccess: () => toast.success("Papel atualizado"),
    onError: (error) => toast.error(error.message),
  })

  const removeMember = useRemoveMemberMutation({
    onSuccess: () => toast.success("Membro removido"),
    onError: (error) => toast.error(error.message),
  })

  if (membersQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (membersQuery.isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar a equipe.
      </p>
    )
  }

  const members = membersQuery.data ?? []

  if (members.length === 0) {
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
                <Badge variant={member.status === "active" ? "secondary" : "outline"}>
                  {statusLabel(member.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {canManage ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={removeMember.isPending}
                    onClick={() =>
                      removeMember.mutate({ membershipId: member.id })
                    }
                  >
                    Remover
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
