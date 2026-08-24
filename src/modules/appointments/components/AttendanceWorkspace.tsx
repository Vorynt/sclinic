"use client"

import { useEffect, type ReactNode } from "react"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Skeleton } from "@/components/ui/skeleton"
import { AttendanceBottomBar } from "@/modules/appointments/components/AttendanceBottomBar"
import { AttendanceContextRail } from "@/modules/appointments/components/AttendanceContextRail"
import { AttendanceHeader } from "@/modules/appointments/components/AttendanceHeader"
import { AttendancePanelSheets } from "@/modules/appointments/components/AttendancePanelSheets"
import { useAttendanceBootstrapQuery } from "@/modules/appointments/hooks/use-appointments"
import { ClinicalNotesPanel } from "@/modules/medical-records/components/ClinicalNotesPanel"
import { useAttendanceUiStore } from "@/stores/attendance.store"

type AttendanceWorkspaceProps = {
  appointmentId: string
  children?: ReactNode
}

/**
 * Clinical attendance cockpit: notes stay mounted; vitals, documents and
 * patient context open as sheets. Lives under `(attendance)` with AttendanceShell.
 */
export function AttendanceWorkspace({
  appointmentId,
}: AttendanceWorkspaceProps) {
  const bootstrapQuery = useAttendanceBootstrapQuery(appointmentId)
  const endPreparingAttendance = useAttendanceUiStore(
    (state) => state.endPreparingAttendance,
  )
  const setPanel = useAttendanceUiStore((state) => state.setPanel)

  useEffect(() => {
    if (bootstrapQuery.isLoading) return
    endPreparingAttendance()
  }, [bootstrapQuery.isLoading, endPreparingAttendance])

  useEffect(() => {
    return () => {
      setPanel(null)
    }
  }, [setPanel])

  if (bootstrapQuery.isLoading) {
    return <AttendanceWorkspaceSkeleton />
  }

  if (bootstrapQuery.isError || !bootstrapQuery.data) {
    return (
      <div className="flex flex-col gap-2 py-8">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Atendimento
        </h1>
        <QueryErrorState
          description="Não foi possível carregar o agendamento."
          onRetry={() => {
            void bootstrapQuery.refetch()
          }}
          isRetrying={bootstrapQuery.isFetching}
        />
      </div>
    )
  }

  const appointment = bootstrapQuery.data.appointment

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-8">
      <AttendanceHeader appointment={appointment} />

      <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="hidden min-w-0 lg:block">
          <AttendanceContextRail appointment={appointment} />
        </div>
        <div className="min-w-0">
          <ClinicalNotesPanel appointmentId={appointmentId} />
        </div>
      </div>

      <AttendancePanelSheets appointment={appointment} />
      <AttendanceBottomBar appointment={appointment} />
    </div>
  )
}

function AttendanceWorkspaceSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando atendimento"
      className="flex min-h-0 flex-1 flex-col gap-6 pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-8"
    >
      <div className="flex flex-col gap-3 border-b pb-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="hidden flex-col gap-4 lg:flex">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  )
}
