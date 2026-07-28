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
import { ReceptionOpsBoard } from "@/modules/dashboard/components/home/ReceptionOpsBoard"

export function ReceptionistHome() {
  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Receba pacientes, acompanhe o dia e registre pagamentos no balcão." />

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

      <ReceptionOpsBoard />
    </div>
  )
}
