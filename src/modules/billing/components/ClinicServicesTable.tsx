"use client";

import { PencilSimpleIcon, PowerIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { ListCard } from "@/components/data-table/ListCard";
import { ListCardSkeleton } from "@/components/data-table/ListCardSkeleton";
import { ResponsiveDataView } from "@/components/data-table/ResponsiveDataView";
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
import {
  useDeleteClinicServiceMutation,
  useUpdateClinicServiceMutation,
} from "@/modules/billing/hooks/use-clinic-service-mutations";
import { useClinicServicesQuery } from "@/modules/billing/hooks/use-clinic-services";
import type { ClinicService } from "@/modules/billing/types/clinic-service";
import { formatCentsToBrl } from "@/modules/billing/utils/money";
import { useAuth } from "@/providers/AuthProvider";
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators";

type ClinicServicesTableProps = {
  filters: ListQueryParams;
  onPageChange: (page: number) => void;
  onEdit: (service: ClinicService) => void;
};

function ServiceRowActions({
  service,
  isReactivatePending,
  onEdit,
  onDeactivate,
  onReactivate,
}: {
  service: ClinicService;
  isReactivatePending: boolean;
  onEdit: (service: ClinicService) => void;
  onDeactivate: (service: ClinicService) => void;
  onReactivate: (service: ClinicService) => void;
}) {
  return (
    <ButtonGroup className="justify-end">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        tooltip="Editar"
        onClick={() => onEdit(service)}>
        <PencilSimpleIcon />
        <span className="sr-only">Editar</span>
      </Button>
      {service.isActive ? (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          tooltip="Desativar"
          onClick={() => onDeactivate(service)}>
          <PowerIcon />
          <span className="sr-only">Desativar</span>
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          tooltip="Reativar"
          disabled={isReactivatePending}
          onClick={() => onReactivate(service)}>
          <PowerIcon />
          <span className="sr-only">Reativar</span>
        </Button>
      )}
    </ButtonGroup>
  );
}

export function ClinicServicesTable({
  filters,
  onPageChange,
  onEdit,
}: ClinicServicesTableProps) {
  const { can } = useAuth();
  const canManage = can(Permission.FINANCIAL_MANAGE);
  const [serviceToDeactivate, setServiceToDeactivate] =
    useState<ClinicService | null>(null);

  const servicesQuery = useClinicServicesQuery({
    q: filters.q,
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? DEFAULT_LIST_PAGE_SIZE,
  });

  const deleteService = useDeleteClinicServiceMutation({
    onSuccess: () => {
      toast.success("Serviço desativado");
      setServiceToDeactivate(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateService = useUpdateClinicServiceMutation({
    onSuccess: () => {
      toast.success("Serviço reativado");
    },
    onError: (error) => toast.error(error.message),
  });

  if (servicesQuery.isLoading) {
    return (
      <ResponsiveDataView
        desktop={
          <TableSkeleton
            columns={canManage ? 4 : 3}
            rows={DEFAULT_LIST_PAGE_SIZE}
          />
        }
        mobile={<ListCardSkeleton rows={DEFAULT_LIST_PAGE_SIZE} />}
      />
    );
  }

  if (servicesQuery.isError) {
    return (
      <QueryErrorState
        description="Não foi possível carregar os serviços."
        onRetry={() => {
          void servicesQuery.refetch();
        }}
        isRetrying={servicesQuery.isFetching}
      />
    );
  }

  const result = servicesQuery.data;
  const services = result?.items ?? [];

  if (services.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Nenhum serviço encontrado</EmptyTitle>
          <EmptyDescription>
            {canManage
              ? "Cadastre um serviço para definir preços na agenda."
              : "Nenhum serviço corresponde à busca."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveDataView
        desktop={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                {canManage ? (
                  <TableHead className="text-right">Ações</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatCentsToBrl(service.priceCents)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? "secondary" : "outline"}>
                      {service.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="flex justify-end text-right">
                      <ServiceRowActions
                        service={service}
                        isReactivatePending={updateService.isPending}
                        onEdit={onEdit}
                        onDeactivate={setServiceToDeactivate}
                        onReactivate={(s) =>
                          updateService.mutate({
                            id: s.id,
                            isActive: true,
                          })
                        }
                      />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
        mobile={
          <div className="flex flex-col gap-2">
            {services.map((service) => (
              <ListCard
                key={service.id}
                title={service.name}
                badges={
                  <Badge variant={service.isActive ? "secondary" : "outline"}>
                    {service.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                }
                trailing={
                  <span className="text-sm font-semibold tabular-nums tracking-tight text-foreground">
                    {formatCentsToBrl(service.priceCents)}
                  </span>
                }
                actions={
                  canManage ? (
                    <ServiceRowActions
                      service={service}
                      isReactivatePending={updateService.isPending}
                      onEdit={onEdit}
                      onDeactivate={setServiceToDeactivate}
                      onReactivate={(s) =>
                        updateService.mutate({
                          id: s.id,
                          isActive: true,
                        })
                      }
                    />
                  ) : undefined
                }
              />
            ))}
          </div>
        }
      />

      <DataTablePagination
        page={result?.page ?? filters.page ?? 1}
        pageSize={
          result?.pageSize ?? filters.pageSize ?? DEFAULT_LIST_PAGE_SIZE
        }
        total={result?.total ?? 0}
        onPageChange={onPageChange}
      />

      <AlertDialog
        open={Boolean(serviceToDeactivate)}
        onOpenChange={(open) => {
          if (!open) setServiceToDeactivate(null);
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              O serviço <strong>{serviceToDeactivate?.name}</strong> deixará de
              aparecer na agenda. Cobranças anteriores permanecem inalteradas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteService.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteService.isPending}
              onClick={() => {
                if (serviceToDeactivate) {
                  deleteService.mutate(serviceToDeactivate.id);
                }
              }}>
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
