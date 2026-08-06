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

export function NurseHome() {
  const [hoursOpen, setHoursOpen] = useState(false)
  const schedulingQuery = useProfessionalsForSchedulingQuery()
  const mine = schedulingQuery.data?.[0] ?? null

  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Acompanhe a agenda e o apoio ao atendimento." />

      <HomeDayOpsStats
        title="Fila clínica"
        description="Priorize quem já chegou e acompanhe o restante do dia."
        emphasizeArrived
      />

      <TodaysAppointmentsPreview
        title="Agenda do dia"
        description="Sua agenda de hoje."
        emptyMessage="Nenhum atendimento na sua agenda hoje."
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
