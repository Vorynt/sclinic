"use client"

import {
  CalendarPlusIcon,
  FileTextIcon,
  PulseIcon,
  UserIcon,
} from "@phosphor-icons/react"

import { AttendanceCompleteAction } from "@/modules/appointments/components/AttendanceCompleteAction"
import { AttendanceTabButton } from "@/modules/appointments/components/AttendanceTabButton"
import type { AttendancePanel } from "@/modules/appointments/constants/attendance-panels"
import { useAttendancePanel } from "@/modules/appointments/hooks/use-attendance-panel"
import type { Appointment } from "@/modules/appointments/types/appointment"

type AttendanceBottomBarProps = {
  appointment: Appointment
}

const TABS: {
  panel: AttendancePanel
  label: string
  icon: typeof UserIcon
}[] = [
  { panel: "patient", label: "Paciente", icon: UserIcon },
  { panel: "vitals", label: "Vitais", icon: PulseIcon },
  { panel: "documents", label: "Docs", icon: FileTextIcon },
  { panel: "next", label: "Retorno", icon: CalendarPlusIcon },
]

export function AttendanceBottomBar({ appointment }: AttendanceBottomBarProps) {
  const { panel, setPanel } = useAttendancePanel()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl supports-backdrop-filter:bg-background/75 lg:hidden"
      aria-label="Ações do atendimento"
    >
      <ul className="mx-auto grid h-14 max-w-7xl grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
        {TABS.map((tab) => (
          <li key={tab.panel} className="min-w-0">
            <AttendanceTabButton
              icon={tab.icon}
              label={tab.label}
              active={panel === tab.panel}
              onClick={() => setPanel(tab.panel)}
            />
          </li>
        ))}
        <AttendanceCompleteAction
          appointment={appointment}
          presentation="tab"
        />
      </ul>
    </nav>
  )
}
