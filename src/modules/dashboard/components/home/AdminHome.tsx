"use client"

import {
  CalendarBlankIcon,
  QuestionIcon,
  StethoscopeIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"
import { endOfDay, startOfDay } from "date-fns"
import { useMemo } from "react"

import { routes } from "@/config/routes"
import { useAppointmentsQuery } from "@/modules/appointments/hooks/use-appointments"
import { HomeDayOpsStats } from "@/modules/dashboard/components/home/shared/HomeDayOpsStats"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { HomeStatCards } from "@/modules/dashboard/components/home/shared/HomeStatCards"
import { TodaysAppointmentsPreview } from "@/modules/dashboard/components/home/shared/TodaysAppointmentsPreview"
import { summarizeDayOps } from "@/modules/dashboard/utils/day-ops-stats"
import { usePatientsQuery } from "@/modules/patients/hooks/use-patients"
import {
  useInvitationsQuery,
  useMembersQuery,
} from "@/modules/users/hooks/use-users"

export function AdminHome() {
  const dayRange = useMemo(() => {
    const now = new Date()
    return { from: startOfDay(now), to: endOfDay(now) }
  }, [])

  const appointmentsQuery = useAppointmentsQuery(dayRange)
  const dayStats = summarizeDayOps(appointmentsQuery.data ?? [])
  const membersQuery = useMembersQuery({ page: 1, pageSize: 100 })
  const invitationsQuery = useInvitationsQuery()
  const patientsQuery = usePatientsQuery({ page: 1, pageSize: 1 })

  const activeMembers =
    membersQuery.data?.items.filter((member) => member.status === "active")
      .length ?? 0
  const pendingInvites = invitationsQuery.data?.length ?? 0

  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Operação e equipe da clínica." />

      <HomeSection
        title="Operação"
        description="Visão rápida da clínica para o dia a dia."
      >
        <HomeStatCards
          items={[
            {
              label: "Agendamentos hoje",
              value: appointmentsQuery.isLoading
                ? "…"
                : String(dayStats.total),
              hint: "Exceto cancelados",
            },
            {
              label: "Convites pendentes",
              value: invitationsQuery.isLoading
                ? "…"
                : String(pendingInvites),
              hint: "Aguardando aceite",
            },
            {
              label: "Equipe ativa",
              value: membersQuery.isLoading ? "…" : String(activeMembers),
              hint: "Membros ativos",
            },
            {
              label: "Pacientes",
              value: patientsQuery.isLoading
                ? "…"
                : String(patientsQuery.data?.total ?? 0),
              hint: "Cadastros ativos",
            },
          ]}
        />
      </HomeSection>

      <HomeDayOpsStats
        title="Fluxo do dia"
        description="Distribuição dos atendimentos de hoje."
      />

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
