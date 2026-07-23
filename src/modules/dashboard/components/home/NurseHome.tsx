"use client"

import { CalendarBlankIcon, UsersIcon } from "@phosphor-icons/react"

import { routes } from "@/config/routes"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { TodaysAppointmentsPreview } from "@/modules/dashboard/components/home/shared/TodaysAppointmentsPreview"

export function NurseHome() {
  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Acompanhe a agenda e o apoio ao atendimento." />

      <TodaysAppointmentsPreview
        title="Agenda do dia"
        description="Visão clínica dos atendimentos de hoje."
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
              label: "Agenda",
              href: routes.appointments,
              icon: CalendarBlankIcon,
            },
          ]}
        />
      </HomeSection>
    </div>
  )
}
