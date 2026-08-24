import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { getQueryClient } from "@/lib/get-query-client"
import { setQueryClinicId } from "@/lib/query-clinic-scope"
import { AttendanceWorkspace } from "@/modules/appointments/components/AttendanceWorkspace"
import { appointmentsQueries } from "@/modules/appointments/queries/appointments.query"
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session"
import { PermissionProvider } from "@/providers/PermissionProvider"

export const metadata: Metadata = {
  title: "Atendimento",
}

type AttendanceLayoutProps = {
  children: ReactNode
  params: Promise<{ appointmentId: string }>
}

export default async function AttendanceLayout({
  children,
  params,
}: AttendanceLayoutProps) {
  const { appointmentId } = await params
  const session = await getCachedSession()
  setQueryClinicId(session?.session.activeClinicId ?? null)
  const queryClient = getQueryClient()

  await queryClient
    .prefetchQuery(appointmentsQueries.attendanceBootstrap(appointmentId))
    .catch(() => undefined)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PermissionProvider
        permission={Permission.RECORDS_READ}
        fallback={<ForbiddenBlock />}>
        <PermissionProvider
          permissions={[
            Permission.APPOINTMENTS_CREATE,
            Permission.APPOINTMENTS_UPDATE,
          ]}
          mode="any"
          fallback={<ForbiddenBlock />}>
          <AttendanceWorkspace appointmentId={appointmentId}>
            {children}
          </AttendanceWorkspace>
        </PermissionProvider>
      </PermissionProvider>
    </HydrationBoundary>
  )
}
