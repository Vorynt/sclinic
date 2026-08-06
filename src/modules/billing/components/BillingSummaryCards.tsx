"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { QueryErrorState } from "@/components/status/QueryErrorState";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBillingSummaryQuery } from "@/modules/billing/hooks/use-charges";
import type { ChargeStatus } from "@/modules/billing/types/charge";
import { formatCentsToBrl } from "@/modules/billing/utils/money";

type StatusFilter = "all" | ChargeStatus;

type BillingSummaryCardsProps = {
  selectedStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
};

type SummaryCardConfig = {
  status: ChargeStatus;
  label: string;
  amountCents: number;
  countLabel: string;
};

export function BillingSummaryCards({
  selectedStatus,
  onStatusChange,
}: BillingSummaryCardsProps) {
  const summaryQuery = useBillingSummaryQuery();

  if (summaryQuery.isLoading) {
    return <BillingSummaryCardsSkeleton />;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar o resumo financeiro."
        onRetry={() => {
          void summaryQuery.refetch();
        }}
        isRetrying={summaryQuery.isFetching}
      />
    );
  }

  const summary = summaryQuery.data;
  const referenceMonth = format(new Date(), "MMMM 'de' yyyy", {
    locale: ptBR,
  });
  const cards: SummaryCardConfig[] = [
    {
      status: "pending",
      label: "A receber",
      amountCents: summary.pendingTotalCents,
      countLabel:
        summary.pendingCount === 1
          ? "1 cobrança pendente"
          : `${summary.pendingCount} cobranças pendentes`,
    },
    {
      status: "paid",
      label: `Recebido em ${referenceMonth}`,
      amountCents: summary.paidThisMonthCents,
      countLabel:
        summary.paidThisMonthCount === 1
          ? "1 pagamento"
          : `${summary.paidThisMonthCount} pagamentos`,
    },
  ];

  function handleSelect(status: ChargeStatus) {
    onStatusChange(selectedStatus === status ? "all" : status);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((card) => {
        const selected = selectedStatus === card.status;

        return (
          <Card
            key={card.status}
            size="sm"
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            onClick={() => handleSelect(card.status)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleSelect(card.status);
              }
            }}
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/40",
              selected && "bg-muted/50 ring-2 ring-ring",
            )}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums tracking-tight">
                {formatCentsToBrl(card.amountCents)}
              </CardTitle>
              <CardDescription>{card.countLabel}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}

export function BillingSummaryCardsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 2 }, (_, index) => (
        <Card key={index} size="sm">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-36" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
