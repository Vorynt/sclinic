"use client"

import {
  CalendarBlankIcon,
  CheckCircleIcon,
  ClockIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react"
import { endOfDay, startOfDay } from "date-fns"
import { useMemo } from "react"

import { useAppointmentsQuery } from "@/modules/appointments/hooks/use-appointments"
import {
  HomeStatCards,
  type HomeStatCard,
} from "@/modules/dashboard/components/home/shared/HomeStatCards"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { summarizeDayOps } from "@/modules/dashboard/utils/day-ops-stats"

type HomeDayOpsStatsProps = {
  title?: string
  description?: string
  /** When true, emphasizes checked-in (nurse home). */
  emphasizeArrived?: boolean
}

export function HomeDayOpsStats({
  title = "Hoje",
  description = "Resumo operacional da agenda do dia.",
  emphasizeArrived = false,
}: HomeDayOpsStatsProps) {
  const range = useMemo(() => {
    const now = new Date()
    return { from: startOfDay(now), to: endOfDay(now) }
  }, [])

  const query = useAppointmentsQuery(range)
  const stats = summarizeDayOps(query.data ?? [])
  const loading = query.isLoading

  const items: HomeStatCard[] = [
    {
      label: "Agendamentos",
      value: loading ? "…" : String(stats.total),
      hint: "Exceto cancelados",
      icon: CalendarBlankIcon,
    },
    {
      label: emphasizeArrived ? "Já chegaram" : "Aguardando",
      value: loading
        ? "…"
        : String(emphasizeArrived ? stats.inProgress : stats.waiting),
      hint: emphasizeArrived
        ? "Check-in feito"
        : "Agendados ou confirmados",
      icon: emphasizeArrived ? StethoscopeIcon : ClockIcon,
      accent: emphasizeArrived ? "success" : "info",
    },
    {
      label: emphasizeArrived ? "Aguardando" : "Em atendimento",
      value: loading
        ? "…"
        : String(emphasizeArrived ? stats.waiting : stats.inProgress),
      hint: emphasizeArrived ? "Ainda não chegaram" : "Check-in feito",
      icon: emphasizeArrived ? ClockIcon : StethoscopeIcon,
      accent: emphasizeArrived ? "info" : "success",
    },
    {
      label: "Concluídos",
      value: loading ? "…" : String(stats.completed),
      icon: CheckCircleIcon,
      accent: "success",
    },
  ]

  return (
    <HomeSection title={title} description={description}>
      <HomeStatCards items={items} />
    </HomeSection>
  )
}
