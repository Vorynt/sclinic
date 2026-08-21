"use client";

import {
  CheckCircleIcon,
  CurrencyCircleDollarIcon,
  EyeIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { AppointmentPeekSheet } from "@/modules/appointments/components/AppointmentPeekSheet";
import { MarkChargePaidDialog } from "@/modules/billing/components/MarkChargePaidDialog";
import {
  CHARGE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/billing/constants/charges";
import type { MarkChargePaidDto } from "@/modules/billing/dto/mark-charge-paid.dto";
import {
  useCancelChargeMutation,
  useMarkChargePaidMutation,
} from "@/modules/billing/hooks/use-charge-mutations";
import { useChargesQuery } from "@/modules/billing/hooks/use-charges";
import type { ListChargesInput } from "@/modules/billing/schemas/charge.schema";
import type {
  ChargeListItem,
  ChargeStatus,
} from "@/modules/billing/types/charge";
import { formatCentsToBrl } from "@/modules/billing/utils/money";
import { useAuth } from "@/providers/AuthProvider";
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators";

type ChargesTableProps = {
  filters: ListChargesInput;
  onPageChange: (page: number) => void;
};

function statusVariant(
  status: ChargeStatus,
):
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "success"
  | "warning"
  | "info" {
  if (status === "paid") return "success";
  if (status === "pending") return "warning";
  if (status === "canceled" || status === "failed") return "outline";
  return "info";
}

function isOverdue(charge: ChargeListItem) {
  return (
    charge.status === "pending" &&
    charge.dueAt !== null &&
    charge.dueAt.getTime() < Date.now()
  );
}

function formatAppointment(charge: ChargeListItem) {
  return format(charge.appointmentStartsAt, "dd MMM yyyy · HH:mm", {
    locale: ptBR,
  });
}

function formatDue(charge: ChargeListItem) {
  if (!charge.dueAt) return "—";
  return format(charge.dueAt, "dd/MM/yyyy", { locale: ptBR });
}

function ChargeRowActions({
  charge,
  canCollect,
  canPeekAppointment,
  onPay,
  onCancel,
  onPeekAppointment,
}: {
  charge: ChargeListItem;
  canCollect: boolean;
  canPeekAppointment: boolean;
  onPay: (charge: ChargeListItem) => void;
  onCancel: (charge: ChargeListItem) => void;
  onPeekAppointment: (appointmentId: string) => void;
}) {
  const showCollectActions = canCollect && charge.status === "pending";
  if (!canPeekAppointment && !showCollectActions) return null;

  return (
    <ButtonGroup>
      {canPeekAppointment ? (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          tooltip="Ver consulta"
          onClick={() => onPeekAppointment(charge.appointmentId)}>
          <EyeIcon />
          <span className="sr-only">Ver consulta</span>
        </Button>
      ) : null}
      {showCollectActions ? (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            tooltip="Marcar pago"
            onClick={() => onPay(charge)}>
            <CheckCircleIcon />
            <span className="sr-only">Marcar pago</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            tooltip="Cancelar cobrança"
            onClick={() => onCancel(charge)}>
            <XCircleIcon />
            <span className="sr-only">Cancelar cobrança</span>
          </Button>
        </>
      ) : null}
    </ButtonGroup>
  );
}

export function ChargesTable({ filters, onPageChange }: ChargesTableProps) {
  const { can, canAny } = useAuth();
  const canCollect = canAny(
    Permission.FINANCIAL_COLLECT,
    Permission.FINANCIAL_MANAGE,
  );
  const canManageFinancial = can(Permission.FINANCIAL_MANAGE);
  const canPeekAppointment = canAny(
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_UPDATE,
    Permission.APPOINTMENTS_DELETE,
  );
  const chargesQuery = useChargesQuery(filters);

  const [chargeToPay, setChargeToPay] = useState<ChargeListItem | null>(null);
  const [chargeToCancel, setChargeToCancel] = useState<ChargeListItem | null>(
    null,
  );
  const [peekAppointmentId, setPeekAppointmentId] = useState<string | null>(
    null,
  );

  const markPaid = useMarkChargePaidMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado");
      setChargeToPay(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const cancelCharge = useCancelChargeMutation({
    onSuccess: () => {
      toast.success("Cobrança cancelada");
      setChargeToCancel(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const dialogs = (
    <>
      {canPeekAppointment ? (
        <AppointmentPeekSheet
          appointmentId={peekAppointmentId}
          open={Boolean(peekAppointmentId)}
          onOpenChange={(open) => {
            if (!open) setPeekAppointmentId(null);
          }}
        />
      ) : null}

      <MarkChargePaidDialog
        open={Boolean(chargeToPay)}
        onOpenChange={(open) => {
          if (!open) setChargeToPay(null);
        }}
        patientName={chargeToPay?.patientName}
        listAmountCents={
          chargeToPay?.listAmountCents ?? chargeToPay?.amountCents
        }
        discountPercent={chargeToPay?.discountPercent ?? 0}
        serviceName={chargeToPay?.serviceName ?? undefined}
        billingKind={chargeToPay?.billingKind ?? "standard"}
        canManage={canManageFinancial}
        isPending={markPaid.isPending}
        onConfirm={(payload) => {
          if (!chargeToPay) return;
          markPaid.mutate({
            chargeId: chargeToPay.id,
            method: payload.method,
            ...(payload.discountPercent !== undefined
              ? { discountPercent: payload.discountPercent }
              : {}),
            ...(payload.amountCentsOverride !== undefined
              ? { amountCentsOverride: payload.amountCentsOverride }
              : {}),
          } as MarkChargePaidDto);
        }}
      />

      <AlertDialog
        open={Boolean(chargeToCancel)}
        onOpenChange={(open) => {
          if (!open) setChargeToCancel(null);
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar cobrança?</AlertDialogTitle>
            <AlertDialogDescription>
              A cobrança pendente será cancelada. Você poderá criar outra para o
              mesmo agendamento depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelCharge.isPending || !chargeToCancel}
              onClick={(event) => {
                event.preventDefault();
                if (!chargeToCancel) return;
                cancelCharge.mutate({ chargeId: chargeToCancel.id });
              }}>
              Cancelar cobrança
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (chargesQuery.isLoading) {
    return (
      <ResponsiveDataView
        desktop={<TableSkeleton columns={7} rows={DEFAULT_LIST_PAGE_SIZE} />}
        mobile={<ListCardSkeleton rows={DEFAULT_LIST_PAGE_SIZE} />}
      />
    );
  }

  if (chargesQuery.isError) {
    return (
      <QueryErrorState
        description="Não foi possível carregar as cobranças."
        onRetry={() => {
          void chargesQuery.refetch();
        }}
        isRetrying={chargesQuery.isFetching}
      />
    );
  }

  const result = chargesQuery.data;
  const items = result?.items ?? [];

  if (items.length === 0) {
    return (
      <Empty className="border border-dashed py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CurrencyCircleDollarIcon weight="duotone" />
          </EmptyMedia>
          <EmptyTitle>Nenhuma cobrança encontrada</EmptyTitle>
          <EmptyDescription>
            Ajuste os filtros ou crie uma cobrança ao agendar a consulta.
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
                <TableHead>Paciente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Consulta</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((charge) => (
                <TableRow key={charge.id}>
                  <TableCell className="max-w-48 font-medium">
                    <span className="block truncate" title={charge.patientName}>
                      {charge.patientName}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-40 truncate">
                    {charge.serviceName ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatAppointment(charge)}
                  </TableCell>
                  <TableCell
                    className={
                      isOverdue(charge)
                        ? "whitespace-nowrap text-destructive"
                        : "whitespace-nowrap text-muted-foreground"
                    }>
                    {formatDue(charge)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={statusVariant(charge.status)}>
                        {CHARGE_STATUS_LABELS[charge.status] ?? charge.status}
                        {charge.paymentMethod ? (
                          <span className="relative before:content-['|'] before:mr-1 before:text-muted-foreground text-xs text-muted-foreground">
                            {PAYMENT_METHOD_LABELS[charge.paymentMethod] ??
                              charge.paymentMethod}
                          </span>
                        ) : null}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCentsToBrl(charge.amountCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <ChargeRowActions
                        charge={charge}
                        canCollect={canCollect}
                        canPeekAppointment={canPeekAppointment}
                        onPay={setChargeToPay}
                        onCancel={setChargeToCancel}
                        onPeekAppointment={setPeekAppointmentId}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
        mobile={
          <div className="flex flex-col gap-2">
            {items.map((charge) => (
              <ListCard
                key={charge.id}
                collapsible
                leading={
                  <CurrencyCircleDollarIcon weight="duotone" aria-hidden />
                }
                title={charge.patientName}
                badges={
                  <Badge variant={statusVariant(charge.status)}>
                    {CHARGE_STATUS_LABELS[charge.status] ?? charge.status}
                  </Badge>
                }
                preview={`${charge.serviceName ?? "Serviço"} · ${formatAppointment(charge)}`}
                trailing={
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCentsToBrl(charge.amountCents)}
                  </span>
                }
                meta={[
                  { label: "Vencimento", value: formatDue(charge) },
                  {
                    label: "Pagamento",
                    value: charge.paymentMethod
                      ? (PAYMENT_METHOD_LABELS[charge.paymentMethod] ??
                        charge.paymentMethod)
                      : "—",
                  },
                ]}
                actions={
                  <ChargeRowActions
                    charge={charge}
                    canCollect={canCollect}
                    canPeekAppointment={canPeekAppointment}
                    onPay={setChargeToPay}
                    onCancel={setChargeToCancel}
                    onPeekAppointment={setPeekAppointmentId}
                  />
                }
              />
            ))}
          </div>
        }
      />

      <DataTablePagination
        page={result?.page ?? filters.page}
        pageSize={result?.pageSize ?? filters.pageSize}
        total={result?.total ?? 0}
        onPageChange={onPageChange}
      />

      {dialogs}
    </div>
  );
}
