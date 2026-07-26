"use client"

import { CurrencyCircleDollarIcon, UsersIcon } from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { useBillingSummaryQuery } from "@/modules/billing/hooks/use-charges"
import { formatCentsToBrl } from "@/modules/billing/utils/money"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"

export function FinancialHome() {
  const summaryQuery = useBillingSummaryQuery()
  const referenceMonth = format(new Date(), "MMMM 'de' yyyy", {
    locale: ptBR,
  })

  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Acompanhe o financeiro da clínica." />

      <HomeSection
        title="Resumo financeiro"
        description="Valores a receber e recebidos no mês corrente."
      >
        {summaryQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : summaryQuery.isError || !summaryQuery.data ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar o resumo financeiro.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card size="sm">
              <CardHeader>
                <CardDescription>A receber</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {formatCentsToBrl(summaryQuery.data.pendingTotalCents)}
                </CardTitle>
                <CardDescription>
                  {summaryQuery.data.pendingCount} cobrança
                  {summaryQuery.data.pendingCount === 1 ? "" : "s"} pendente
                  {summaryQuery.data.pendingCount === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardDescription>
                  Recebido em {referenceMonth}
                </CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {formatCentsToBrl(summaryQuery.data.paidThisMonthCents)}
                </CardTitle>
                <CardDescription>
                  {summaryQuery.data.paidThisMonthCount} pagamento
                  {summaryQuery.data.paidThisMonthCount === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </HomeSection>

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
            {
              label: "Faturamento",
              href: routes.billing,
              icon: CurrencyCircleDollarIcon,
            },
            {
              label: "Pacientes",
              href: routes.patients,
              icon: UsersIcon,
            },
          ]}
        />
      </HomeSection>
    </div>
  )
}
