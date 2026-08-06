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
import { Skeleton } from "@/components/ui/skeleton";
import { Permission } from "@/config/permissions";
import { AppointmentPeekSheet } from "@/modules/appointments/components/AppointmentPeekSheet";
import { MarkChargePaidDialog } from "@/modules/billing/components/MarkChargePaidDialog";
import { CHARGE_STATUS_LABELS } from "@/modules/billing/constants/charges";
import {
  useCancelChargeMutation,
  useMarkChargePaidMutation,
} from "@/modules/billing/hooks/use-charge-mutations";
import { useChargesQuery } from "@/modules/billing/hooks/use-charges";
import type {
  ChargeListItem,
  ChargeStatus,
} from "@/modules/billing/types/charge";
import type { MarkChargePaidDto } from "@/modules/billing/dto/mark-charge-paid.dto";
import { formatCentsToBrl } from "@/modules/billing/utils/money";
import { useAuth } from "@/providers/AuthProvider";
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators";

type ChargesTableProps = {
  filters: {
    q?: string;
    page: number;
    pageSize: number;
    status?: ChargeStatus;
  };
  onPageChange: (page: number) => void;
};

function statusVariant(
  status: ChargeStatus,
): "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info" {
  if (status === "paid") return "success"
  if (status === "pending") return "warning"
  if (status === "canceled" || status === "failed") return "outline"
  return "info"
}

function ChargesSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function ChargeCard({
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
  const showActions = canPeekAppointment || showCollectActions;

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <CurrencyCircleDollarIcon
          className="size-4"
          weight="duotone"
          aria-hidden
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium text-foreground">
            {charge.patientName}
          </p>
          <Badge variant={statusVariant(charge.status)}>
            {CHARGE_STATUS_LABELS[charge.status] ?? charge.status}
          </Badge>
        </div>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          Consulta{" "}
          {format(charge.appointmentStartsAt, "dd MMM yyyy · HH:mm", {
            locale: ptBR,
          })}
          <span className="mx-1.5 text-border">·</span>
          Criada em {format(charge.createdAt, "dd/MM/yyyy", { locale: ptBR })}
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold tabular-nums tracking-tight text-foreground">
        {formatCentsToBrl(charge.amountCents)}
      </p>

      {showActions ? (
        <ButtonGroup className="shrink-0">
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
      ) : null}
    </div>
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

  if (chargesQuery.isLoading) {
    return <ChargesSkeleton rows={DEFAULT_LIST_PAGE_SIZE} />;
  }

  if (chargesQuery.isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar as cobranças.
      </p>
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
            Crie uma cobrança ao agendar a consulta.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {items.map((charge) => (
          <ChargeCard
            key={charge.id}
            charge={charge}
            canCollect={canCollect}
            canPeekAppointment={canPeekAppointment}
            onPay={setChargeToPay}
            onCancel={setChargeToCancel}
            onPeekAppointment={setPeekAppointmentId}
          />
        ))}
      </div>

      <DataTablePagination
        page={result?.page ?? filters.page}
        pageSize={result?.pageSize ?? filters.pageSize}
        total={result?.total ?? 0}
        onPageChange={onPageChange}
      />

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
    </div>
  );
}
