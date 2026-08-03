"use client"

import { CheckCircleIcon } from "@phosphor-icons/react"
import { endOfDay, format, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Permission } from "@/config/permissions"
import { useClinicOpsRealtime } from "@/hooks/use-clinic-ops-realtime"
import { useAppointmentsQuery } from "@/modules/appointments/hooks/use-appointments"
import type { Appointment } from "@/modules/appointments/types/appointment"
import { MarkChargePaidDialog } from "@/modules/billing/components/MarkChargePaidDialog"
import { useMarkChargePaidMutation } from "@/modules/billing/hooks/use-charge-mutations"
import { useActiveChargesByAppointmentsQuery } from "@/modules/billing/hooks/use-charges"
import type { MarkChargePaidDto } from "@/modules/billing/dto/mark-charge-paid.dto"
import type { Charge } from "@/modules/billing/types/charge"
import { formatCentsToBrl } from "@/modules/billing/utils/money"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import {
  classifyReceptionBoardColumn,
} from "@/modules/dashboard/utils/reception-board"
import { useAuth } from "@/providers/AuthProvider"

type BoardItem = {
  appointment: Appointment
  charge: Charge | null
}

type ChargeToPay = {
  charge: Charge
  patientName: string
}

type ReceptionBoardCardProps = {
  item: BoardItem
  canCollect: boolean
  onPay: (payload: ChargeToPay) => void
}

function ReceptionBoardCard({
  item,
  canCollect,
  onPay,
}: ReceptionBoardCardProps) {
  const { appointment, charge } = item

  return (
    <li className="flex items-center justify-between gap-3 bg-card px-4 py-3">
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
      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
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
            }
          >
            <CheckCircleIcon />
            Receber
          </Button>
        ) : null}
      </div>
    </li>
  )
}

type BoardColumnProps = {
  title: string
  items: BoardItem[]
  emptyMessage: string
  canCollect: boolean
  onPay: (payload: ChargeToPay) => void
}

function BoardColumn({
  title,
  items,
  emptyMessage,
  canCollect,
  onPay,
}: BoardColumnProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl bg-muted/40 px-4 py-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
          {emptyMessage}
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl ring-1 ring-foreground/10">
          {items.map((item) => (
            <ReceptionBoardCard
              key={item.appointment.id}
              item={item}
              canCollect={canCollect}
              onPay={onPay}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

/** Operational day board for reception (ADR-006). */
export function ReceptionOpsBoard() {
  useClinicOpsRealtime(true)

  const { can, canAny, isLoading: authLoading } = useAuth()
  const canCollect = canAny(
    Permission.FINANCIAL_COLLECT,
    Permission.FINANCIAL_MANAGE,
  )
  const canManageFinancial = can(Permission.FINANCIAL_MANAGE)
  const canSeeCharges = canAny(
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_COLLECT,
    Permission.FINANCIAL_MANAGE,
  )

  const range = useMemo(() => {
    const now = new Date()
    return { from: startOfDay(now), to: endOfDay(now) }
  }, [])

  const appointmentsQuery = useAppointmentsQuery(range)
  const appointments = appointmentsQuery.data ?? []
  const appointmentIds = useMemo(
    () => appointments.map((item) => item.id),
    [appointments],
  )

  const chargesQuery = useActiveChargesByAppointmentsQuery(
    appointmentIds,
    !authLoading && canSeeCharges && appointmentIds.length > 0,
  )

  const chargeByAppointmentId = useMemo(() => {
    const map = new Map<string, Charge>()
    for (const charge of chargesQuery.data ?? []) {
      map.set(charge.appointmentId, charge)
    }
    return map
  }, [chargesQuery.data])

  const columns = useMemo(() => {
    const upcoming: BoardItem[] = []
    const inProgress: BoardItem[] = []
    const awaitingPayment: BoardItem[] = []

    const sorted = [...appointments].sort(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
    )

    for (const appointment of sorted) {
      const charge = chargeByAppointmentId.get(appointment.id) ?? null
      const column = classifyReceptionBoardColumn(appointment, charge)
      const item = { appointment, charge }
      if (column === "upcoming") upcoming.push(item)
      if (column === "in_progress") inProgress.push(item)
      if (column === "awaiting_payment") awaitingPayment.push(item)
    }

    return { upcoming, inProgress, awaitingPayment }
  }, [appointments, chargeByAppointmentId])

  const [chargeToPay, setChargeToPay] = useState<ChargeToPay | null>(null)

  const markPaid = useMarkChargePaidMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado")
      setChargeToPay(null)
    },
    onError: (error) => toast.error(error.message),
  })

  const isLoading =
    appointmentsQuery.isLoading ||
    (canSeeCharges && appointmentIds.length > 0 && chargesQuery.isLoading)

  return (
    <>
      <HomeSection
        title="Painel do dia"
        description={format(range.from, "EEEE, dd 'de' MMMM", {
          locale: ptBR,
        })}
      >
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
              canCollect={false}
              onPay={setChargeToPay}
            />
            <BoardColumn
              title="Em atendimento"
              items={columns.inProgress}
              emptyMessage="Nenhum atendimento em andamento."
              canCollect={false}
              onPay={setChargeToPay}
            />
            <BoardColumn
              title="Aguardando pagamento"
              items={columns.awaitingPayment}
              emptyMessage="Nenhuma cobrança pendente."
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
            if (!open) setChargeToPay(null)
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
            } as MarkChargePaidDto)
          }}
        />
      ) : null}
    </>
  )
}
