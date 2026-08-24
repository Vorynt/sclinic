"use client"

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"

type AppointmentCardExpandContextValue = {
  expandedId: string | null
  toggle: (id: string) => void
}

const AppointmentCardExpandContext =
  createContext<AppointmentCardExpandContextValue | null>(null)

export function AppointmentCardExpandProvider({
  children,
}: {
  children: ReactNode
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <AppointmentCardExpandContext.Provider
      value={{
        expandedId,
        toggle: (id) => {
          setExpandedId((current) => (current === id ? null : id))
        },
      }}>
      {children}
    </AppointmentCardExpandContext.Provider>
  )
}

export function useExpandedAppointmentId() {
  return useContext(AppointmentCardExpandContext)?.expandedId ?? null
}

export function useAppointmentCardExpand(appointmentId: string) {
  const ctx = useContext(AppointmentCardExpandContext)
  const [localExpanded, setLocalExpanded] = useState(false)

  if (!ctx) {
    return {
      expanded: localExpanded,
      toggle: () => {
        setLocalExpanded((current) => !current)
      },
    }
  }

  return {
    expanded: ctx.expandedId === appointmentId,
    toggle: () => ctx.toggle(appointmentId),
  }
}
