"use client";

import { CheckCircleIcon, ClockIcon, StethoscopeIcon, WalletIcon } from "@phosphor-icons/react";
import { endOfDay, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Permission } from "@/config/permissions";
import { useClinicOpsRealtime } from "@/hooks/use-clinic-ops-realtime";
import { cn } from "@/lib/utils";
import { useConfirmAppointmentsBatchMutation } from "@/modules/appointments/hooks/use-appointment-mutations";
import { useAppointmentsQuery } from "@/modules/appointments/hooks/use-appointments";
import type { Appointment } from "@/modules/appointments/types/appointment";
import { MarkChargePaidDialog } from "@/modules/billing/components/MarkChargePaidDialog";
import type { MarkChargePaidDto } from "@/modules/billing/dto/mark-charge-paid.dto";
import { useMarkChargePaidMutation } from "@/modules/billing/hooks/use-charge-mutations";
import { useActiveChargesByAppointmentsQuery } from "@/modules/billing/hooks/use-charges";
import type { Charge } from "@/modules/billing/types/charge";
import { formatCentsToBrl } from "@/modules/billing/utils/money";
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection";
import { classifyReceptionBoardColumn } from "@/modules/dashboard/utils/reception-board";
import { useAuth } from "@/providers/AuthProvider";

type BoardItem = {
  appointment: Appointment;
  charge: Charge | null;
};

type ChargeToPay = {
  charge: Charge;
  patientName: string;
};

type ReceptionBoardCardProps = {
  item: BoardItem;
  canCollect: boolean;
  onPay: (payload: ChargeToPay) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string, checked: boolean) => void;
};

function ReceptionBoardCard({
  item,
  canCollect,
  onPay,
  selectable,
  selected,
  onToggleSelect,
}: ReceptionBoardCardProps) {
  const { appointment, charge } = item;

  return (
    <li className="flex flex-col gap-3 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {selectable ? (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) =>
              onToggleSelect?.(appointment.id, checked === true)
            }
            aria-label={`Selecionar ${appointment.patientName}`}
          />
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {appointment.patientName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {appointment.professionalName
              ? `${appointment.professionalName} · `
              : null}
            {format(appointment.startsAt, "HH:mm")}–
            {format(appointment.endsAt, "HH:mm")}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        {charge ? (
          <Badge variant="outline" className="tabular-nums">
            {formatCentsToBrl(charge.amountCents)}
          </Badge>
        ) : null}
        {canCollect && charge?.status === "pending" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              onPay({
                charge,
                patientName: appointment.patientName,
              })
            }>
            <CheckCircleIcon />
            Receber
          </Button>
        ) : null}
      </div>
    </li>
  );
}

type BoardColumnAccent = "info" | "success" | "warning";

type BoardColumnProps = {
  title: string
  items: BoardItem[]
  emptyMessage: string
  emptyIcon: typeof ClockIcon
  accent: BoardColumnAccent
  canCollect: boolean
  onPay: (payload: ChargeToPay) => void
  selectedIds?: Set<string>
  onToggleSelect?: (id: string, checked: boolean) => void
  canSelect?: (appointment: Appointment) => boolean
}

const COLUMN_ACCENT: Record<
  BoardColumnAccent,
  { bar: string; badge: "info" | "success" | "warning" }
> = {
  info: { bar: "bg-primary", badge: "info" },
  success: { bar: "bg-chart-2", badge: "success" },
  warning: { bar: "bg-chart-1", badge: "warning" },
}

function BoardColumn({
  title,
  items,
  emptyMessage,
  emptyIcon: EmptyIcon,
  accent,
  canCollect,
  onPay,
  selectedIds,
  onToggleSelect,
  canSelect,
}: BoardColumnProps) {
  const tone = COLUMN_ACCENT[accent]

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden
          className={cn("size-1.5 shrink-0 rounded-full", tone.bar)}
        />
        <h3 className="truncate text-sm font-medium text-foreground">
          {title}
        </h3>
        <Badge variant={tone.badge} className="shrink-0">
          {items.length}
        </Badge>
      </div>
      {items.length === 0 ? (
        <Empty className="rounded-xl border border-dashed border-border/80 bg-muted/30 py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <EmptyIcon weight="duotone" />
            </EmptyMedia>
            <EmptyTitle>Nada por aqui</EmptyTitle>
            <EmptyDescription>{emptyMessage}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_4%,transparent)] ring-1 ring-foreground/8">
          {items.map((item) => (
            <ReceptionBoardCard
              key={item.appointment.id}
              item={item}
              canCollect={canCollect}
              onPay={onPay}
              selectable={canSelect?.(item.appointment) ?? false}
              selected={selectedIds?.has(item.appointment.id) ?? false}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

/** Operational day board for reception (ADR-006). */
export function ReceptionOpsBoard() {
  useClinicOpsRealtime(true);

  const { can, canAny, isLoading: authLoading } = useAuth();
  const canCollect = canAny(
    Permission.FINANCIAL_COLLECT,
    Permission.FINANCIAL_MANAGE,
  );
  const canManageFinancial = can(Permission.FINANCIAL_MANAGE);
  const canSeeCharges = canAny(
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_COLLECT,
    Permission.FINANCIAL_MANAGE,
  );
  const canConfirm = can(Permission.APPOINTMENTS_UPDATE);

  const range = useMemo(() => {
    const now = new Date();
    return { from: startOfDay(now), to: endOfDay(now) };
  }, []);

  const appointmentsQuery = useAppointmentsQuery(range);
  const appointments = useMemo(
    () => appointmentsQuery.data ?? [],
    [appointmentsQuery.data],
  );
  const appointmentIds = useMemo(
    () => appointments.map((item) => item.id),
    [appointments],
  );

  const chargesQuery = useActiveChargesByAppointmentsQuery(
    appointmentIds,
    !authLoading && canSeeCharges && appointmentIds.length > 0,
  );

  const chargeByAppointmentId = useMemo(() => {
    const map = new Map<string, Charge>();
    for (const charge of chargesQuery.data ?? []) {
      map.set(charge.appointmentId, charge);
    }
    return map;
  }, [chargesQuery.data]);

  const columns = useMemo(() => {
    const upcoming: BoardItem[] = [];
    const inProgress: BoardItem[] = [];
    const awaitingPayment: BoardItem[] = [];

    const sorted = [...appointments].sort(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
    );

    for (const appointment of sorted) {
      const charge = chargeByAppointmentId.get(appointment.id) ?? null;
      const column = classifyReceptionBoardColumn(appointment, charge);
      const item = { appointment, charge };
      if (column === "upcoming") upcoming.push(item);
      if (column === "in_progress") inProgress.push(item);
      if (column === "awaiting_payment") awaitingPayment.push(item);
    }

    return { upcoming, inProgress, awaitingPayment };
  }, [appointments, chargeByAppointmentId]);

  const [chargeToPay, setChargeToPay] = useState<ChargeToPay | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const markPaid = useMarkChargePaidMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado");
      setChargeToPay(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const confirmBatch = useConfirmAppointmentsBatchMutation({
    onSuccess: (result) => {
      setSelectedIds(new Set());
      if (result.confirmedCount === 0) {
        toast.info("Nenhum agendamento pôde ser confirmado.");
        return;
      }
      toast.success(
        result.skippedCount > 0
          ? `${result.confirmedCount} agendamento(s) confirmado(s), ${result.skippedCount} ignorado(s).`
          : `${result.confirmedCount} agendamento(s) confirmado(s).`,
      );
    },
    onError: (error) => toast.error(error.message),
  });

  const confirmableUpcoming = useMemo(
    () =>
      columns.upcoming.filter(
        (item) => item.appointment.status === "scheduled",
      ),
    [columns.upcoming],
  );

  const canSelectAppointment = (appointment: Appointment) =>
    canConfirm && appointment.status === "scheduled";

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleConfirmSelected = () => {
    if (selectedIds.size === 0) return;
    confirmBatch.mutate({ appointmentIds: Array.from(selectedIds) });
  };

  const handleConfirmAllToday = () => {
    const ids = confirmableUpcoming.map((item) => item.appointment.id);
    if (ids.length === 0) return;
    confirmBatch.mutate({ appointmentIds: ids });
  };

  const isLoading =
    appointmentsQuery.isLoading ||
    (canSeeCharges && appointmentIds.length > 0 && chargesQuery.isLoading);

  return (
    <>
      <HomeSection
        title="Painel do dia"
        description={format(range.from, "EEEE, dd 'de' MMMM", {
          locale: ptBR,
        })}
        action={
          canConfirm && confirmableUpcoming.length > 0 ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={selectedIds.size === 0 || confirmBatch.isPending}
                onClick={handleConfirmSelected}>
                Confirmar selecionados
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={confirmBatch.isPending}
                onClick={handleConfirmAllToday}>
                Confirmar todos do dia
              </Button>
            </div>
          ) : undefined
        }>
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <BoardColumn
              title="Próximos"
              items={columns.upcoming}
              emptyMessage="Nenhum paciente aguardando."
              emptyIcon={ClockIcon}
              accent="info"
              canCollect={false}
              onPay={setChargeToPay}
              canSelect={canSelectAppointment}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
            <BoardColumn
              title="Em atendimento"
              items={columns.inProgress}
              emptyMessage="Nenhum atendimento em andamento."
              emptyIcon={StethoscopeIcon}
              accent="success"
              canCollect={false}
              onPay={setChargeToPay}
            />
            <BoardColumn
              title="Aguardando pagamento"
              items={columns.awaitingPayment}
              emptyMessage="Nenhuma cobrança pendente."
              emptyIcon={WalletIcon}
              accent="warning"
              canCollect={canCollect}
              onPay={setChargeToPay}
            />
          </div>
        )}
      </HomeSection>

      {chargeToPay ? (
        <MarkChargePaidDialog
          open={Boolean(chargeToPay)}
          onOpenChange={(open) => {
            if (!open) setChargeToPay(null);
          }}
          patientName={chargeToPay.patientName}
          listAmountCents={
            chargeToPay.charge.listAmountCents ?? chargeToPay.charge.amountCents
          }
          discountPercent={chargeToPay.charge.discountPercent ?? 0}
          serviceName={chargeToPay.charge.serviceName ?? undefined}
          billingKind={chargeToPay.charge.billingKind ?? "standard"}
          canManage={canManageFinancial}
          isPending={markPaid.isPending}
          onConfirm={(payload) => {
            markPaid.mutate({
              chargeId: chargeToPay.charge.id,
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
      ) : null}
    </>
  );
}
