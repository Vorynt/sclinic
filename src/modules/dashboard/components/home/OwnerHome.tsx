"use client"

import {
  CalendarBlankIcon,
  ChartBarIcon,
  CreditCardIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"
import { addMonths, format, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useMemo } from "react"

import { routes } from "@/config/routes"
import { useBillingSummaryQuery } from "@/modules/billing/hooks/use-charges"
import { useClinicPlanQuota } from "@/modules/billing/hooks/use-clinic-plan-quota"
import { formatCentsToBrl } from "@/modules/billing/utils/money"
import { useClinic } from "@/modules/clinics/hooks/use-clinic"
import type { ClinicSubscriptionStatus } from "@/modules/clinics/types/clinic"
import { useAppointmentsCountQuery } from "@/modules/appointments/hooks/use-appointments"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { HomeStatCards } from "@/modules/dashboard/components/home/shared/HomeStatCards"
import { usePatientsQuery } from "@/modules/patients/hooks/use-patients"
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
  const patientsQuery = usePatientsQuery({ page: 1, pageSize: 1 })
  const billingQuery = useBillingSummaryQuery()

  const monthRange = useMemo(() => {
    const now = new Date()
    const from = startOfMonth(now)
    return { from, to: addMonths(from, 1) }
  }, [])
  const monthCountQuery = useAppointmentsCountQuery({
    from: monthRange.from,
    to: monthRange.to,
    excludeCanceled: true,
  })

  const subscriptionStatus = clinicQuery.data?.subscriptionStatus
  const subscriptionLabel = subscriptionStatus
    ? SUBSCRIPTION_LABELS[subscriptionStatus]
    : "—"

  const monthLabel = format(monthRange.from, "MMMM yyyy", { locale: ptBR })
  const quota = quotaQuery.data

  const statsLoading =
    clinicQuery.isLoading ||
    quotaQuery.isLoading ||
    patientsQuery.isLoading ||
    billingQuery.isLoading ||
    monthCountQuery.isLoading

  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Visão geral da clínica, plano e indicadores." />

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
            },
            {
              label: "Usuários",
              value: quotaQuery.isLoading
                ? "…"
                : quota
                  ? formatQuota(quota.usage.users, quota.limits.maxUsers)
                  : "—",
              hint: quota?.over.users ? "Acima da cota" : "Cota do plano",
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
            },
            {
              label: "Pacientes",
              value: patientsQuery.isLoading
                ? "…"
                : String(patientsQuery.data?.total ?? 0),
              hint: "Cadastros ativos",
            },
            {
              label: "Agendamentos do mês",
              value: monthCountQuery.isLoading
                ? "…"
                : String(monthCountQuery.data ?? 0),
              hint: monthLabel,
            },
            {
              label: "A receber",
              value: billingQuery.isLoading
                ? "…"
                : billingQuery.data
                  ? formatCentsToBrl(billingQuery.data.pendingTotalCents)
                  : "—",
              hint: billingQuery.data
                ? `${billingQuery.data.pendingCount} cobrança${billingQuery.data.pendingCount === 1 ? "" : "s"}`
                : undefined,
            },
            {
              label: "Recebido no mês",
              value: billingQuery.isLoading
                ? "…"
                : billingQuery.data
                  ? formatCentsToBrl(billingQuery.data.paidThisMonthCents)
                  : "—",
              hint: billingQuery.data
                ? `${billingQuery.data.paidThisMonthCount} pagamento${billingQuery.data.paidThisMonthCount === 1 ? "" : "s"}`
                : undefined,
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
          ]}
        />
      </HomeSection>
    </div>
  )
}
