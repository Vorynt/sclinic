"use client"

import {
  CalendarBlankIcon,
  CalendarPlusIcon,
  UserPlusIcon,
} from "@phosphor-icons/react"

import { routes } from "@/config/routes"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { TodaysAppointmentsPreview } from "@/modules/dashboard/components/home/shared/TodaysAppointmentsPreview"

export function ReceptionistHome() {
  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Receba pacientes e organize a agenda do dia." />

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
            {
              label: "Novo agendamento",
              href: routes.appointments,
              icon: CalendarPlusIcon,
            },
            {
              label: "Novo paciente",
              href: routes.patients,
              icon: UserPlusIcon,
            },
            {
              label: "Abrir agenda",
              href: routes.appointments,
              icon: CalendarBlankIcon,
            },
          ]}
        />
      </HomeSection>

      <TodaysAppointmentsPreview
        title="Próximos de hoje"
        emptyMessage="Nenhum agendamento restante para hoje."
      />
    </div>
  )
}
