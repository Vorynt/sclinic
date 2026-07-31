import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { routes } from "@/config/routes"
import { authService } from "@/modules/authentication/services/auth.service"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { AccountShell } from "@/modules/users/components/AccountShell"

type AccountRootLayoutProps = {
  children: ReactNode
}

/**
 * Isolated from `(dashboard)` so account UI is not clinic-scoped (no AppShell).
 * Owner with blocked SaaS entitlement may still access billing self-service.
 */
export default async function AccountRootLayout({
  children,
}: AccountRootLayoutProps) {
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
    // Billing self-service zone: owner can regularize without product entitlement.
    if (session.subscriptionBlockedClinic?.isOwner) {
      return (
        <AccountShell backHref={routes.selectClinic}>{children}</AccountShell>
      )
    }
    if (session.subscriptionBlockedClinic || session.needsClinicSelection) {
      redirect(routes.selectClinic)
    }
    redirect(routes.onboardingPlan)
  }

  return <AccountShell>{children}</AccountShell>
}
