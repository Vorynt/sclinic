"use client"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBillingInsightsQuery } from "@/modules/billing/hooks/use-charges"
import type { BillingInsightsInput } from "@/modules/billing/schemas/charge.schema"
import { formatCentsToBrl } from "@/modules/billing/utils/money"

type BillingSummaryCardsProps = {
  filters: BillingInsightsInput
}

function countLabel(count: number, singular: string, plural: string) {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`
}

export function BillingSummaryCards({ filters }: BillingSummaryCardsProps) {
  const insightsQuery = useBillingInsightsQuery(filters)

  if (insightsQuery.isLoading) {
    return <BillingSummaryCardsSkeleton />
  }

  if (insightsQuery.isError || !insightsQuery.data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar o resumo financeiro."
        onRetry={() => {
          void insightsQuery.refetch()
        }}
        isRetrying={insightsQuery.isFetching}
      />
    )
  }

  const { kpis } = insightsQuery.data
  const cards = [
    {
      id: "received",
      label: "Recebido no período",
      amountCents: kpis.receivedCents,
      hint: countLabel(kpis.receivedCount, "pagamento", "pagamentos"),
    },
    {
      id: "pending",
      label: "A receber no período",
      amountCents: kpis.pendingCents,
      hint: countLabel(
        kpis.pendingCount,
        "cobrança pendente",
        "cobranças pendentes",
      ),
    },
    {
      id: "overdue",
      label: "Inadimplente no período",
      amountCents: kpis.overdueCents,
      hint: countLabel(
        kpis.overdueCount,
        "cobrança vencida",
        "cobranças vencidas",
      ),
    },
    {
      id: "ticket",
      label: "Ticket médio",
      amountCents: kpis.averageTicketCents,
      hint: "Média por pagamento recebido",
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.id} size="sm">
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums tracking-tight">
              {formatCentsToBrl(card.amountCents)}
            </CardTitle>
            <CardDescription>{card.hint}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

export function BillingSummaryCardsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} size="sm">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-36" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
