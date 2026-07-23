"use client"

import { CalendarBlankIcon } from "@phosphor-icons/react"

import { routes } from "@/config/routes"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { TodaysAppointmentsPreview } from "@/modules/dashboard/components/home/shared/TodaysAppointmentsPreview"

export function DoctorHome() {
  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Seus próximos atendimentos e atalhos clínicos." />

      <TodaysAppointmentsPreview
        title="Próximos atendimentos"
        description="Lista do dia da clínica. Filtro pela sua agenda virá em breve."
        emptyMessage="Nenhum atendimento previsto para hoje."
      />

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
            {
              label: "Minha agenda",
              href: routes.appointments,
              icon: CalendarBlankIcon,
            },
          ]}
        />
      </HomeSection>
    </div>
  )
}
