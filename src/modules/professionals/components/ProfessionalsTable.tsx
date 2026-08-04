"use client";

import { useState } from "react";
import { toast } from "sonner";

import { DataTablePagination } from "@/components/data-table/DataTablePagination";
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
  EmptyTitle,
} from "@/components/ui/empty";
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
  ACCOUNT_STATUS_LABELS,
  formatProfessionalDisplayName,
  getAffiliationTypeLabel,
  getProfessionalRoleLabel,
} from "@/modules/professionals/constants/professionals";
import {
  useDeleteProfessionalMutation,
  useSetProfessionalStatusMutation,
} from "@/modules/professionals/hooks/use-professional-mutations";
import { useProfessionalsQuery } from "@/modules/professionals/hooks/use-professionals";
import type {
  ProfessionalAccountStatus,
  ProfessionalListItem,
} from "@/modules/professionals/types/professional";
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators";
import {
  CheckCircleIcon,
  PencilSimpleIcon,
  ProhibitIcon,
  TrashIcon,
} from "@phosphor-icons/react";

type ProfessionalsTableProps = {
  filters: ListQueryParams;
  onPageChange: (page: number) => void;
  onEdit: (professional: ProfessionalListItem) => void;
};

function accountStatusBadgeVariant(
  status: ProfessionalAccountStatus,
): "secondary" | "outline" {
  return status === "active" ? "secondary" : "outline";
}

function accountStatusLabel(status: ProfessionalAccountStatus): string {
  return ACCOUNT_STATUS_LABELS[status] ?? status;
}

export function ProfessionalsTable({
  filters,
  onPageChange,
  onEdit,
}: ProfessionalsTableProps) {
  const [professionalToDelete, setProfessionalToDelete] =
    useState<ProfessionalListItem | null>(null);

  const professionalsQuery = useProfessionalsQuery(filters);

  const setStatus = useSetProfessionalStatusMutation({
    onSuccess: () => toast.success("Status atualizado"),
    onError: (error) => toast.error(error.message),
  });

  const deleteProfessional = useDeleteProfessionalMutation({
    onSuccess: () => {
      toast.success("Profissional removido");
      setProfessionalToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  if (professionalsQuery.isLoading) {
    return <TableSkeleton columns={6} rows={DEFAULT_LIST_PAGE_SIZE} />;
  }

  if (professionalsQuery.isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os profissionais.
      </p>
    );
  }

  const result = professionalsQuery.data;
  const professionals = result?.items ?? [];

  if (professionals.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Nenhum profissional</EmptyTitle>
          <EmptyDescription>
            Cadastre um profissional para começar a montar o corpo clínico.
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
            <TableHead>Afiliação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {professionals.map((professional) => {
            const nextStatus =
              professional.status === "active" ? "inactive" : "active";
            const isTogglePending = setStatus.isPending;
            const displayName = formatProfessionalDisplayName({
              fullName: professional.fullName,
              treatmentPronoun: professional.treatmentPronoun,
              fallback: professional.email ?? "—",
            });

            return (
              <TableRow key={professional.id}>
                <TableCell
                  className="max-w-60 truncate font-medium"
                  title={displayName}>
                  {displayName}
                </TableCell>
                <TableCell>{professional.email || "—"}</TableCell>
                <TableCell>
                  {getProfessionalRoleLabel(
                    professional.roleKey,
                    professional.roleName,
                  )}
                </TableCell>
                <TableCell>
                  {getAffiliationTypeLabel(professional.affiliationType)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={accountStatusBadgeVariant(
                      professional.accountStatus,
                    )}>
                    {accountStatusLabel(professional.accountStatus)}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-end justify-end text-right">
                  <ButtonGroup>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      tooltip="Editar"
                      onClick={() => onEdit(professional)}>
                      <PencilSimpleIcon />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      tooltip={
                        professional.status === "active"
                          ? "Desativar"
                          : "Ativar"
                      }
                      disabled={isTogglePending}
                      onClick={() =>
                        setStatus.mutate({
                          id: professional.id,
                          status: nextStatus,
                        })
                      }>
                      {professional.status === "active" ? (
                        <ProhibitIcon />
                      ) : (
                        <CheckCircleIcon />
                      )}
                      <span className="sr-only">
                        {professional.status === "active"
                          ? "Desativar"
                          : "Ativar"}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      tooltip="Remover"
                      onClick={() => setProfessionalToDelete(professional)}>
                      <TrashIcon />
                      <span className="sr-only">Remover</span>
                    </Button>
                  </ButtonGroup>
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
        open={Boolean(professionalToDelete)}
        onOpenChange={(open) => {
          if (!open) setProfessionalToDelete(null);
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong className="wrap-anywhere">
                {formatProfessionalDisplayName({
                  fullName: professionalToDelete?.fullName,
                  treatmentPronoun: professionalToDelete?.treatmentPronoun,
                  fallback: professionalToDelete?.email ?? "este profissional",
                })}
              </strong>
              ? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProfessional.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteProfessional.isPending}
              onClick={() => {
                if (professionalToDelete) {
                  deleteProfessional.mutate(professionalToDelete.id);
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
