"use client"

import { UsersIcon } from "@phosphor-icons/react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { routes } from "@/config/routes"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { HomeStatPlaceholders } from "@/modules/dashboard/components/home/shared/HomeStatPlaceholders"

export function FinancialHome() {
  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Acompanhe o financeiro da clínica." />

      <HomeSection
        title="Resumo financeiro"
        description="Indicadores de caixa e cobrança chegarão em breve."
      >
        <HomeStatPlaceholders
          items={[
            { label: "A receber", hint: "Em breve" },
            { label: "Recebido no mês", hint: "Em breve" },
            { label: "Inadimplência", hint: "Em breve" },
          ]}
        />
      </HomeSection>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Financeiro clínico</CardTitle>
          <CardDescription>
            O módulo de faturamento da clínica ainda está em construção. Por
            enquanto, use o cadastro de pacientes quando precisar consultar
            dados básicos.
          </CardDescription>
        </CardHeader>
      </Card>

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
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
