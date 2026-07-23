"use client"

import { CalendarBlankIcon, UsersIcon } from "@phosphor-icons/react"

import { routes } from "@/config/routes"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"

export function DefaultHome() {
  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Use a sidebar para navegar entre os módulos." />

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
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
