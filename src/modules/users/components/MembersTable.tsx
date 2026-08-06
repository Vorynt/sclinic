"use client";

import { UsersThreeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { QueryErrorState } from "@/components/status/QueryErrorState";
import { TableSkeleton } from "@/components/status/TableSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ListQueryParams } from "@/hooks/use-list-query-params";
import {
  type AssignableRoleKey,
  getRoleLabel,
  getTeamStatusLabel,
  type TeamRowStatus,
  USERS_CONSTANTS,
} from "@/modules/users/constants/users";
import {
  useRemoveMemberMutation,
  useRevokeInvitationMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberStatusMutation,
} from "@/modules/users/hooks/use-user-mutations";
import {
  useAssignableRolesQuery,
  useInvitationsQuery,
  useMembersQuery,
} from "@/modules/users/hooks/use-users";
import type { ClinicMember } from "@/modules/users/types/member";
import { isAssignableRoleKey } from "@/modules/users/utils/member-rules";
import { useAuth } from "@/providers/AuthProvider";
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators";
import {
  ArrowsClockwiseIcon,
  ProhibitIcon,
  TrashIcon,
} from "@phosphor-icons/react";

type MembersTableProps = {
  filters: ListQueryParams;
  onPageChange: (page: number) => void;
};

function statusBadgeVariant(status: TeamRowStatus): "secondary" | "outline" {
  return status === "active" ? "secondary" : "outline";
}

export function MembersTable({ filters, onPageChange }: MembersTableProps) {
  const { auth } = useAuth();
  const [memberToRemove, setMemberToRemove] = useState<ClinicMember | null>(
    null,
  );
  const membersQuery = useMembersQuery(filters);
  const invitationsQuery = useInvitationsQuery();
  const rolesQuery = useAssignableRolesQuery();

  const updateRole = useUpdateMemberRoleMutation({
    onSuccess: () => toast.success("Papel atualizado"),
    onError: (error) => toast.error(error.message),
  });

  const updateStatus = useUpdateMemberStatusMutation({
    onSuccess: (member) =>
      toast.success(
        member.status === "suspended" ? "Membro suspenso" : "Membro reativado",
      ),
    onError: (error) => toast.error(error.message),
  });

  const removeMember = useRemoveMemberMutation({
    onSuccess: () => {
      toast.success("Membro removido da equipe");
      setMemberToRemove(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeInvite = useRevokeInvitationMutation({
    onSuccess: () => toast.success("Convite cancelado"),
    onError: (error) => toast.error(error.message),
  });

  if (membersQuery.isLoading || invitationsQuery.isLoading) {
    return <TableSkeleton columns={5} rows={DEFAULT_LIST_PAGE_SIZE} />;
  }

  if (membersQuery.isError || invitationsQuery.isError) {
    return (
      <QueryErrorState
        description="Não foi possível carregar a equipe."
        onRetry={() => {
          void membersQuery.refetch();
          void invitationsQuery.refetch();
        }}
        isRetrying={membersQuery.isFetching || invitationsQuery.isFetching}
      />
    );
  }

  const result = membersQuery.data;
  const members = result?.items ?? [];
  const invitations = invitationsQuery.data ?? [];
  const showInvitations = !filters.q && (filters.page ?? 1) === 1;

  if (members.length === 0 && (!showInvitations || invitations.length === 0)) {
    return (
      <Empty className="border border-dashed py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersThreeIcon weight="duotone" />
          </EmptyMedia>
          <EmptyTitle>Nenhum membro</EmptyTitle>
          <EmptyDescription>
            Convide colaboradores para começar a montar a equipe.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
          {showInvitations
            ? invitations.map((invitation) => (
                <TableRow key={`invite-${invitation.id}`}>
                  <TableCell className="text-muted-foreground">—</TableCell>
                  <TableCell className="font-medium">
                    {invitation.email}
                  </TableCell>
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
                        }>
                        <ProhibitIcon />
                        <span className="sr-only">Cancelar convite</span>
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            : null}

          {members.map((member) => {
            const isSelf = member.userId === auth?.user.id;
            const isOwner = member.roleKey === USERS_CONSTANTS.OWNER_ROLE_KEY;
            const canManage = !isSelf && !isOwner;
            const canChangeRole =
              canManage && isAssignableRoleKey(member.roleKey);
            const roleLabel = getRoleLabel(member.roleKey, member.roleName);
            const status: TeamRowStatus =
              member.status === "suspended" ? "suspended" : "active";

            return (
              <TableRow key={member.id}>
                <TableCell
                  className="max-w-60 truncate font-medium"
                  title={member.userName}>
                  {member.userName}
                </TableCell>
                <TableCell>{member.userEmail}</TableCell>
                <TableCell>
                  {canChangeRole ? (
                    <Select
                      value={member.roleKey}
                      onValueChange={(roleKey) =>
                        updateRole.mutate({
                          membershipId: member.id,
                          roleKey: roleKey as AssignableRoleKey,
                        })
                      }
                      disabled={updateRole.isPending}>
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
                    <div className="flex flex-col gap-0.5">
                      <span>{roleLabel}</span>
                    </div>
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
                        variant={
                          status === "suspended" ? "outline" : "destructive"
                        }
                        size="icon"
                        tooltip={
                          status === "suspended" ? "Reativar" : "Suspender"
                        }
                        disabled={
                          updateStatus.isPending || removeMember.isPending
                        }
                        onClick={() =>
                          updateStatus.mutate({
                            membershipId: member.id,
                            status:
                              status === "suspended" ? "active" : "suspended",
                          })
                        }>
                        {status === "suspended" ? (
                          <ArrowsClockwiseIcon />
                        ) : (
                          <ProhibitIcon />
                        )}
                        <span className="sr-only">
                          {status === "suspended" ? "Reativar" : "Suspender"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        tooltip="Remover da equipe"
                        disabled={
                          updateStatus.isPending || removeMember.isPending
                        }
                        onClick={() => setMemberToRemove(member)}>
                        <TrashIcon />
                        <span className="sr-only">Remover da equipe</span>
                      </Button>
                    </ButtonGroup>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <DataTablePagination
        page={result?.page ?? filters.page ?? 1}
        pageSize={
          result?.pageSize ?? filters.pageSize ?? DEFAULT_LIST_PAGE_SIZE
        }
        total={result?.total ?? 0}
        onPageChange={onPageChange}
      />

      <AlertDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null);
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da equipe</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong className="wrap-anywhere">
                {memberToRemove?.userName ?? "este membro"}
              </strong>{" "}
              da equipe? O vínculo deixa de aparecer na listagem e libera a vaga
              do plano; o histórico permanece no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMember.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removeMember.isPending}
              onClick={() => {
                if (memberToRemove) {
                  removeMember.mutate({ membershipId: memberToRemove.id });
                }
              }}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
