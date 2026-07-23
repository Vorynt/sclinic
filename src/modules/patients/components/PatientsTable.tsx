"use client";

import { useState } from "react";
import { toast } from "sonner";

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
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeletePatientMutation } from "@/modules/patients/hooks/use-patient-mutations";
import { usePatientsQuery } from "@/modules/patients/hooks/use-patients";
import type { Patient } from "@/modules/patients/types/patient";
import { formatCpf } from "@/utils/cpf";
import { formatPhone } from "@/utils/phone";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";

type PatientsTableProps = {
  searchQuery?: string;
  onEdit: (patient: Patient) => void;
};

export function PatientsTable({ searchQuery, onEdit }: PatientsTableProps) {
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const patientsQuery = usePatientsQuery({ q: searchQuery });

  const deletePatient = useDeletePatientMutation({
    onSuccess: () => {
      toast.success("Paciente removido");
      setPatientToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  if (patientsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (patientsQuery.isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os pacientes.
      </p>
    );
  }

  const patients = patientsQuery.data ?? [];

  if (patients.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Nenhum paciente encontrado</EmptyTitle>
          <EmptyDescription>
            Cadastre um novo paciente para começar.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
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
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{formatCpf(patient.cpf)}</TableCell>
              <TableCell>
                {patient.phone ? formatPhone(patient.phone) : "—"}
              </TableCell>
              <TableCell>{patient.email || "—"}</TableCell>
              <TableCell className="text-right flex justify-end items-end">
                <ButtonGroup>
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
              <strong>{patientToDelete?.name}</strong>? Essa ação não pode ser
              desfeita.
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
    </>
  );
}
