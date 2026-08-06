"use client"

import {
  CheckCircleIcon,
  CurrencyCircleDollarIcon,
  QuestionIcon,
  UsersIcon,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { useBillingSummaryQuery } from "@/modules/billing/hooks/use-charges"
import { formatCentsToBrl } from "@/modules/billing/utils/money"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomePendingChargesPreview } from "@/modules/dashboard/components/home/shared/HomePendingChargesPreview"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { HomeStatCards } from "@/modules/dashboard/components/home/shared/HomeStatCards"

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
          <QueryErrorState
            description="Não foi possível carregar o resumo financeiro."
            onRetry={() => {
              void summaryQuery.refetch()
            }}
            isRetrying={summaryQuery.isFetching}
          />
        ) : (
          <HomeStatCards
            items={[
              {
                label: "A receber",
                value: formatCentsToBrl(summaryQuery.data.pendingTotalCents),
                hint: `${summaryQuery.data.pendingCount} cobrança${summaryQuery.data.pendingCount === 1 ? "" : "s"} pendente${summaryQuery.data.pendingCount === 1 ? "" : "s"}`,
                icon: CurrencyCircleDollarIcon,
                accent: "warning",
              },
              {
                label: `Recebido em ${referenceMonth}`,
                value: formatCentsToBrl(summaryQuery.data.paidThisMonthCents),
                hint: `${summaryQuery.data.paidThisMonthCount} pagamento${summaryQuery.data.paidThisMonthCount === 1 ? "" : "s"}`,
                icon: CheckCircleIcon,
                accent: "success",
              },
            ]}
          />
        )}
      </HomeSection>

      <HomePendingChargesPreview />

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
            {
              label: "Ajuda",
              href: routes.help,
              icon: QuestionIcon,
            },
          ]}
        />
      </HomeSection>
    </div>
  )
}
