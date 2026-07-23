"use client"

import {
  CalendarBlankIcon,
  StethoscopeIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"

import { routes } from "@/config/routes"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { HomeStatPlaceholders } from "@/modules/dashboard/components/home/shared/HomeStatPlaceholders"
import { TodaysAppointmentsPreview } from "@/modules/dashboard/components/home/shared/TodaysAppointmentsPreview"

export function AdminHome() {
  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting />

      <HomeSection
        title="Operação"
        description="Visão rápida da clínica para o dia a dia."
      >
        <HomeStatPlaceholders
          items={[
            { label: "Agendamentos hoje", hint: "Veja a lista abaixo" },
            { label: "Convites pendentes", hint: "Em breve" },
            { label: "Equipe ativa", hint: "Em breve" },
          ]}
        />
      </HomeSection>

      <TodaysAppointmentsPreview />

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
