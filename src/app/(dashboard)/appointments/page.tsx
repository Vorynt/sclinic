import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { startOfDay } from "date-fns"
import type { Metadata } from "next"
import { Suspense } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { getQueryClient } from "@/lib/get-query-client"
import { setQueryClinicId } from "@/lib/query-clinic-scope"
import { AppointmentsPanel } from "@/modules/appointments/components/AppointmentsPanel"
import { AppointmentsRouteSkeleton } from "@/modules/appointments/components/AppointmentsRouteSkeleton"
import { appointmentsQueries } from "@/modules/appointments/queries/appointments.query"
import {
  getVisibleRange,
  type CalendarViewMode,
} from "@/modules/appointments/utils/calendar-range"
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session"
import { PermissionProvider } from "@/providers/PermissionProvider"
import { parseISODate } from "@/utils/date"

export const metadata: Metadata = {
  title: "Agendamentos",
}

type AppointmentsPageProps = {
  searchParams: Promise<{ mode?: string; date?: string }>
}

function resolveCalendarMode(value: string | undefined): CalendarViewMode {
  if (value === "week" || value === "day") return value
  return "month"
}

export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  const params = await searchParams
  const session = await getCachedSession()
  setQueryClinicId(session?.session.activeClinicId ?? null)
  const queryClient = getQueryClient()

  const mode = resolveCalendarMode(params.mode)
  const date = params.date
    ? (parseISODate(params.date) ?? startOfDay(new Date()))
    : startOfDay(new Date())
  const range = getVisibleRange(mode, date)

  await queryClient
    .prefetchQuery(
      appointmentsQueries.calendarRange({
        ...range,
        includeHours: mode !== "month",
      }),
    )
    .catch(() => undefined)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PermissionProvider
        permissions={[
          Permission.APPOINTMENTS_CREATE,
          Permission.APPOINTMENTS_UPDATE,
        ]}
        mode="any"
        fallback={<ForbiddenBlock />}>
        <Suspense fallback={<AppointmentsRouteSkeleton />}>
          <AppointmentsPanel />
        </Suspense>
      </PermissionProvider>
    </HydrationBoundary>
  )
}
