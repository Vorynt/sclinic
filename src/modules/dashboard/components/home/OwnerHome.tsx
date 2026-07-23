"use client"

import {
  CalendarBlankIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"

import { routes } from "@/config/routes"
import { useClinic } from "@/modules/clinics/hooks/use-clinic"
import type { ClinicSubscriptionStatus } from "@/modules/clinics/types/clinic"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { HomeStatPlaceholders } from "@/modules/dashboard/components/home/shared/HomeStatPlaceholders"
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

export function OwnerHome() {
  const { auth } = useAuth()
  const clinicId = auth?.session.activeClinicId ?? auth?.membership?.clinicId
  const clinicQuery = useClinic(clinicId)
  const subscriptionStatus = clinicQuery.data?.subscriptionStatus
  const subscriptionLabel = subscriptionStatus
    ? SUBSCRIPTION_LABELS[subscriptionStatus]
    : "—"

  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting />

      <HomeSection
        title="Resumo da clínica"
        description="Indicadores serão enriquecidos nas próximas versões."
      >
        <HomeStatPlaceholders
          items={[
            {
              label: "Plano",
              value: clinicQuery.isLoading ? "…" : subscriptionLabel,
              hint: clinicQuery.data?.name,
            },
            {
              label: "Pacientes",
              hint: "Em breve",
            },
            {
              label: "Agendamentos do mês",
              hint: "Em breve",
            },
          ]}
        />
      </HomeSection>

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
            {
              label: "Equipe",
              href: routes.users,
              icon: UsersThreeIcon,
            },
            {
              label: "Pacientes",
              href: routes.patients,
              icon: UsersIcon,
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
