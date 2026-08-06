"use client"

import { useEffect, type ReactNode } from "react"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Spinner } from "@/components/ui/spinner"
import { AttendanceHeader } from "@/modules/appointments/components/AttendanceHeader"
import { AttendanceNav } from "@/modules/appointments/components/AttendanceNav"
import { useAppointmentQuery } from "@/modules/appointments/hooks/use-appointment"
import { useAttendanceUiStore } from "@/stores/attendance.store"

type AttendanceWorkspaceProps = {
  appointmentId: string
  children: ReactNode
}

/**
 * Clinical attendance workspace: patient context + section nav + module slot.
 * Lives under `(attendance)` with AttendanceShell (no AppShell).
 * New clinical modules plug in via attendance-nav + nested routes.
 */
export function AttendanceWorkspace({
  appointmentId,
  children,
}: AttendanceWorkspaceProps) {
  const appointmentQuery = useAppointmentQuery(appointmentId)
  const endPreparingAttendance = useAttendanceUiStore(
    (state) => state.endPreparingAttendance,
  )

  useEffect(() => {
    if (appointmentQuery.isLoading) return
    endPreparingAttendance()
  }, [appointmentQuery.isLoading, endPreparingAttendance])

  if (appointmentQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (appointmentQuery.isError || !appointmentQuery.data) {
    return (
      <div className="flex flex-col gap-2 py-8">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Atendimento
        </h1>
        <QueryErrorState
          description="Não foi possível carregar o agendamento."
          onRetry={() => {
            void appointmentQuery.refetch()
          }}
          isRetrying={appointmentQuery.isFetching}
        />
      </div>
    )
  }

  const appointment = appointmentQuery.data

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <AttendanceHeader appointment={appointment} />

      <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="min-w-0">
          <AttendanceNav appointmentId={appointmentId} />
        </aside>
        <div className="min-w-0 pb-8">{children}</div>
      </div>
    </div>
  )
}
