import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { routes } from "@/config/routes"
import { AttendanceShell } from "@/modules/appointments/components/AttendanceShell"
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session"

type AttendanceRootLayoutProps = {
  children: ReactNode
}

/**
 * Isolated from `(dashboard)` so attendance uses its own chrome (no AppShell).
 * Auth gates mirror the dashboard.
 */
export default async function AttendanceRootLayout({
  children,
}: AttendanceRootLayoutProps) {
  const session = await getCachedSession()

  if (!session) {
    redirect(routes.login)
  }

  if (!session.user.emailVerified) {
    redirect(routes.verifyEmail)
  }

  if (session.user.mustChangePassword) {
    redirect(routes.changePassword)
  }

  if (!session.membership) {
    if (session.hasSuspendedMembershipOnly) {
      redirect(routes.membershipInactive)
    }
    if (session.subscriptionBlockedClinic || session.needsClinicSelection) {
      redirect(routes.selectClinic)
    }
    redirect(routes.onboardingPlan)
  }

  return <AttendanceShell>{children}</AttendanceShell>
}
