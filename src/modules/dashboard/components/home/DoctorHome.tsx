"use client"

import {
  CalendarBlankIcon,
  ClockIcon,
  QuestionIcon,
  UsersIcon,
} from "@phosphor-icons/react"
import { useState } from "react"

import { routes } from "@/config/routes"
import { HomeDayOpsStats } from "@/modules/dashboard/components/home/shared/HomeDayOpsStats"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { TodaysAppointmentsPreview } from "@/modules/dashboard/components/home/shared/TodaysAppointmentsPreview"
import { ProfessionalHoursDialog } from "@/modules/professionals/components/ProfessionalHoursDialog"
import { formatProfessionalDisplayName } from "@/modules/professionals/constants/professionals"
import { useProfessionalsForSchedulingQuery } from "@/modules/professionals/hooks/use-professionals"

export function DoctorHome() {
  const [hoursOpen, setHoursOpen] = useState(false)
  const schedulingQuery = useProfessionalsForSchedulingQuery()
  const mine = schedulingQuery.data?.[0] ?? null

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
            ...(mine
              ? [
                  {
                    label: "Meus horários",
                    icon: ClockIcon,
                    onClick: () => setHoursOpen(true),
                  },
                ]
              : []),
            {
              label: "Ajuda",
              href: routes.help,
              icon: QuestionIcon,
            },
          ]}
        />
      </HomeSection>

      {mine ? (
        <ProfessionalHoursDialog
          professionalId={mine.id}
          professionalName={formatProfessionalDisplayName({
            fullName: mine.fullName,
            treatmentPronoun: mine.treatmentPronoun,
          })}
          open={hoursOpen}
          onOpenChange={setHoursOpen}
          accessMode="self"
        />
      ) : null}
    </div>
  )
}
