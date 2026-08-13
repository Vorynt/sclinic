import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { routes } from "@/config/routes"
import { AppShell } from "@/modules/dashboard/components/AppShell"
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session"

type DashboardLayoutProps = {
  children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
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

  return <AppShell>{children}</AppShell>
}
