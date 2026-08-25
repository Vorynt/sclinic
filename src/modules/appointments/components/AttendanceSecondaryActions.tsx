"use client"

import {
  CalendarPlusIcon,
  FileTextIcon,
  PulseIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Permission } from "@/config/permissions"
import type { AttendancePanel } from "@/modules/appointments/constants/attendance-panels"
import { useAttendancePanel } from "@/modules/appointments/hooks/use-attendance-panel"
import { useAuth } from "@/providers/AuthProvider"

type AttendanceSecondaryActionsProps = {
  size?: "sm" | "default"
  className?: string
}

const ACTIONS: {
  panel: AttendancePanel
  label: string
  icon: typeof PulseIcon
}[] = [
  { panel: "vitals", label: "Vitais", icon: PulseIcon },
  { panel: "documents", label: "Documentos", icon: FileTextIcon },
  { panel: "next", label: "Retorno", icon: CalendarPlusIcon },
]

export function AttendanceSecondaryActions({
  size = "sm",
  className,
}: AttendanceSecondaryActionsProps) {
  const { panel, setPanel } = useAttendancePanel()
  const { can } = useAuth()
  const canCreate = can(Permission.APPOINTMENTS_CREATE)

  return (
    <div className={className}>
      {ACTIONS.map((action) => {
        if (action.panel === "next" && !canCreate) return null
        const Icon = action.icon
        const isActive = panel === action.panel

        return (
          <Button
            key={action.panel}
            type="button"
            variant={isActive ? "secondary" : "outline"}
            size={size}
            onClick={() => setPanel(action.panel)}
          >
            <Icon />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
