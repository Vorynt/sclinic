import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { routes } from "@/config/routes"
import { AppShell } from "@/modules/dashboard/components/AppShell"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"

type DashboardLayoutProps = {
  children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
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
    redirect(routes.onboardingPlan)
  }

  return <AppShell>{children}</AppShell>
}
