import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { routes } from "@/config/routes"
import { AttendanceShell } from "@/modules/appointments/components/AttendanceShell"
import { authService } from "@/modules/authentication/services/auth.service"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"

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
  const session = await authService.getSession(await getAuthRequestContext())

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
