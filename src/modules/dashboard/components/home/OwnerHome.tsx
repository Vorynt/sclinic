"use client"

import {
  CalendarBlankIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CurrencyCircleDollarIcon,
  QuestionIcon,
  StethoscopeIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"
import { format, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

import { routes } from "@/config/routes"
import { useClinicPlanQuota } from "@/modules/billing/hooks/use-clinic-plan-quota"
import { formatCentsToBrl } from "@/modules/billing/utils/money"
import { useClinic } from "@/modules/clinics/hooks/use-clinic"
import type { ClinicSubscriptionStatus } from "@/modules/clinics/types/clinic"
import { OwnerSetupRoadmap } from "@/modules/dashboard/components/home/OwnerSetupRoadmap"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { HomeStatCards } from "@/modules/dashboard/components/home/shared/HomeStatCards"
import { useOwnerHomeStatsQuery } from "@/modules/dashboard/hooks/use-owner-home-stats"
import { useAuth } from "@/providers/AuthProvider"

const SUBSCRIPTION_LABELS: Record<ClinicSubscriptionStatus, string> = {
  none: "Sem plano",
  trialing: "Período de teste",
  active: "Ativo",
  past_due: "Pagamento pendente",
  canceled: "Cancelado",
  unpaid: "Inadimplente",
  incomplete: "Incompleto",
}

function formatQuota(usage: number, limit: number | null): string {
  if (limit == null) return `${usage} · ilimitado`
  return `${usage} / ${limit}`
}

export function OwnerHome() {
  const { auth } = useAuth()
  const clinicId = auth?.session.activeClinicId ?? auth?.membership?.clinicId
  const clinicQuery = useClinic(clinicId)
  const quotaQuery = useClinicPlanQuota()
  const statsQuery = useOwnerHomeStatsQuery()
  const stats = statsQuery.data

  const subscriptionStatus = clinicQuery.data?.subscriptionStatus
  const subscriptionLabel = subscriptionStatus
    ? SUBSCRIPTION_LABELS[subscriptionStatus]
    : "—"

  const monthLabel = format(startOfMonth(new Date()), "MMMM yyyy", {
    locale: ptBR,
  })
  const quota = quotaQuery.data

  const statsLoading =
    clinicQuery.isLoading || quotaQuery.isLoading || statsQuery.isLoading

  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Visão geral da clínica, plano e indicadores." />

      <OwnerSetupRoadmap />

      <HomeSection
        title="Resumo da clínica"
        description="Indicadores do negócio e da operação."
      >
        <HomeStatCards
          items={[
            {
              label: "Plano",
              value: clinicQuery.isLoading ? "…" : subscriptionLabel,
              hint:
                quota?.planName ??
                clinicQuery.data?.name ??
                (statsLoading ? undefined : "Sem plano vinculado"),
              icon: CreditCardIcon,
            },
            {
              label: "Usuários",
              value: quotaQuery.isLoading
                ? "…"
                : quota
                  ? formatQuota(quota.usage.users, quota.limits.maxUsers)
                  : "—",
              hint: quota?.over.users ? "Acima da cota" : "Cota do plano",
              icon: UsersThreeIcon,
            },
            {
              label: "Profissionais",
              value: quotaQuery.isLoading
                ? "…"
                : quota
                  ? formatQuota(
                      quota.usage.professionals,
                      quota.limits.maxProfessionals,
                    )
                  : "—",
              hint: quota?.over.professionals
                ? "Acima da cota"
                : "Cota do plano",
              icon: StethoscopeIcon,
            },
            {
              label: "Pacientes",
              value: statsQuery.isLoading
                ? "…"
                : String(stats?.patientsCount ?? 0),
              hint: "Cadastros ativos",
              icon: UsersIcon,
            },
            {
              label: "Agendamentos do mês",
              value: statsQuery.isLoading
                ? "…"
                : String(stats?.monthAppointmentsCount ?? 0),
              hint: monthLabel,
              icon: CalendarBlankIcon,
            },
            {
              label: "A receber",
              value: statsQuery.isLoading
                ? "…"
                : stats
                  ? formatCentsToBrl(stats.billing.pendingTotalCents)
                  : "—",
              hint: stats
                ? `${stats.billing.pendingCount} cobrança${stats.billing.pendingCount === 1 ? "" : "s"}`
                : undefined,
              icon: CurrencyCircleDollarIcon,
              accent: "warning",
            },
            {
              label: "Recebido no mês",
              value: statsQuery.isLoading
                ? "…"
                : stats
                  ? formatCentsToBrl(stats.billing.paidThisMonthCents)
                  : "—",
              hint: stats
                ? `${stats.billing.paidThisMonthCount} pagamento${stats.billing.paidThisMonthCount === 1 ? "" : "s"}`
                : undefined,
              icon: CheckCircleIcon,
              accent: "success",
            },
          ]}
        />
      </HomeSection>

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
            {
              label: "Assinatura",
              href: routes.accountSubscription,
              icon: CreditCardIcon,
            },
            {
              label: "Uso do plano",
              href: routes.settingsUsage,
              icon: ChartBarIcon,
            },
            {
              label: "Equipe",
              href: routes.users,
              icon: UsersThreeIcon,
            },
            {
              label: "Agendamentos",
              href: routes.appointments,
              icon: CalendarBlankIcon,
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
