import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { routes } from "@/config/routes"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"

export const metadata: Metadata = {
  title: "Dashboard · sclinic",
}

export default async function DashboardPage() {
  const session = await authService.getSession(await getAuthRequestContext())

  if (!session) {
    redirect(routes.login)
  }

  if (!session.membership) {
    redirect(routes.onboardingPlan)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-background px-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="text-sm text-muted-foreground">
        Bem-vindo, {session.user.name}. Clínica pronta para uso.
      </p>
    </div>
  )
}
