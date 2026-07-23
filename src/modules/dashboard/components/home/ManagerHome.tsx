"use client"

import {
  CalendarBlankIcon,
  StethoscopeIcon,
  UsersIcon,
} from "@phosphor-icons/react"

import { routes } from "@/config/routes"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { TodaysAppointmentsPreview } from "@/modules/dashboard/components/home/shared/TodaysAppointmentsPreview"

export function ManagerHome() {
  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting />

      <TodaysAppointmentsPreview
        title="Agenda do dia"
        description="Acompanhe a ocupação e o fluxo clínico."
      />

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
            {
              label: "Pacientes",
              href: routes.patients,
              icon: UsersIcon,
            },
            {
              label: "Profissionais",
              href: routes.professionals,
              icon: StethoscopeIcon,
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
