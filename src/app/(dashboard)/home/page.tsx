import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { endOfDay, startOfDay } from "date-fns"
import type { Metadata } from "next"

import { getQueryClient } from "@/lib/get-query-client"
import { setQueryClinicId } from "@/lib/query-clinic-scope"
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session"
import { HomeByRole } from "@/modules/dashboard/components/home/HomeByRole"
import { dashboardQueries } from "@/modules/dashboard/queries/dashboard.query"

export const metadata: Metadata = {
  title: "Início",
}

export default async function HomePage() {
  const session = await getCachedSession()
  const clinicId = session?.session.activeClinicId ?? null
  setQueryClinicId(clinicId)
  const queryClient = getQueryClient()
  const roleKey = session?.membership?.roleKey

  if (roleKey === "owner") {
    await queryClient
      .prefetchQuery(dashboardQueries.ownerHomeStats())
      .catch(() => undefined)
  } else if (roleKey === "admin") {
    await queryClient
      .prefetchQuery(dashboardQueries.adminHomeStats())
      .catch(() => undefined)
  } else if (roleKey === "receptionist") {
    const now = new Date()
    await queryClient
      .prefetchQuery(
        dashboardQueries.receptionDayBoard({
          from: startOfDay(now),
          to: endOfDay(now),
        }),
      )
      .catch(() => undefined)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeByRole />
    </HydrationBoundary>
  )
}
