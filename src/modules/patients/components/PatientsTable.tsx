"use client";

import {
  CalendarBlankIcon,
  PencilSimpleIcon,
  TrashIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Permission } from "@/config/permissions";
import type { ListQueryParams } from "@/hooks/use-list-query-params";
import { useDeletePatientMutation } from "@/modules/patients/hooks/use-patient-mutations";
import { usePatientsQuery } from "@/modules/patients/hooks/use-patients";
import type { Patient } from "@/modules/patients/types/patient";
import { buildPatientDetailHref } from "@/modules/patients/utils/patients-list-href";
import { useAuth } from "@/providers/AuthProvider";
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators";
import { formatCpf } from "@/utils/cpf";
import { formatPhone } from "@/utils/phone";

type PatientsTableProps = {
  filters: ListQueryParams;
  onPageChange: (page: number) => void;
  onEdit: (patient: Patient) => void;
  onSchedule?: (patient: Patient) => void;
};

export function PatientsTable({
  filters,
  onPageChange,
  onEdit,
  onSchedule,
}: PatientsTableProps) {
  const { can } = useAuth();
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const canSchedule =
    Boolean(onSchedule) && can(Permission.APPOINTMENTS_CREATE);

  const patientsQuery = usePatientsQuery(filters);

  const deletePatient = useDeletePatientMutation({
    onSuccess: () => {
      toast.success("Paciente removido");
      setPatientToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  if (patientsQuery.isLoading) {
    return <TableSkeleton columns={5} rows={DEFAULT_LIST_PAGE_SIZE} />;
  }

  if (patientsQuery.isError) {
    return (
      <QueryErrorState
        description="Não foi possível carregar os pacientes."
        onRetry={() => {
          void patientsQuery.refetch();
        }}
        isRetrying={patientsQuery.isFetching}
      />
    );
  }

  const result = patientsQuery.data;
  const patients = result?.items ?? [];

  if (patients.length === 0) {
    return (
      <Empty className="border border-dashed py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon weight="duotone" />
          </EmptyMedia>
          <EmptyTitle>Nenhum paciente encontrado</EmptyTitle>
          <EmptyDescription>
            Cadastre um novo paciente para começar.
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
            <TableHead>CPF</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="max-w-60 font-medium">
                <Link
                  href={buildPatientDetailHref(patient.id, {
                    q: filters.q,
                    page: filters.page,
                  })}
                  title={patient.name}
                  className="block truncate text-foreground underline-offset-4 hover:underline">
                  {patient.name}
                </Link>
              </TableCell>
              <TableCell>{formatCpf(patient.cpf)}</TableCell>
              <TableCell>
                {patient.phone ? formatPhone(patient.phone) : "—"}
              </TableCell>
              <TableCell>{patient.email || "—"}</TableCell>
              <TableCell className="text-right flex justify-end items-end">
                <ButtonGroup>
                  {canSchedule ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      tooltip="Agendar"
                      onClick={() => onSchedule?.(patient)}>
                      <CalendarBlankIcon />
                      <span className="sr-only">Agendar</span>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    tooltip="Editar"
                    onClick={() => onEdit(patient)}>
                    <PencilSimpleIcon />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    tooltip="Remover"
                    onClick={() => setPatientToDelete(patient)}>
                    <TrashIcon />
                    <span className="sr-only">Remover</span>
                  </Button>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
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
        open={Boolean(patientToDelete)}
        onOpenChange={(open) => {
          if (!open) setPatientToDelete(null);
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong className="wrap-anywhere">
                {patientToDelete?.name}
              </strong>
              ? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePatient.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant={"destructive"}
              disabled={deletePatient.isPending}
              onClick={() => {
                if (patientToDelete) {
                  deletePatient.mutate(patientToDelete.id);
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
