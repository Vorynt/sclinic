"use client"

import {
  CalendarBlankIcon,
  QuestionIcon,
  UsersIcon,
} from "@phosphor-icons/react"

import { routes } from "@/config/routes"
import { HomeDayOpsStats } from "@/modules/dashboard/components/home/shared/HomeDayOpsStats"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { TodaysAppointmentsPreview } from "@/modules/dashboard/components/home/shared/TodaysAppointmentsPreview"

export function DoctorHome() {
  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Sua agenda do dia e atalhos clínicos." />

      <HomeDayOpsStats
        title="Sua agenda hoje"
        description="Resumo dos seus atendimentos de hoje."
      />

      <TodaysAppointmentsPreview
        title="Próximos atendimentos"
        description="Sua agenda de hoje."
        emptyMessage="Nenhum atendimento previsto para você hoje."
      />

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
            {
              label: "Minha agenda",
              href: routes.appointments,
              icon: CalendarBlankIcon,
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
