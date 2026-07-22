import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { routes } from "@/config/routes"
import { PlanPicker } from "@/modules/billing/components/PlanPicker"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"

export const metadata: Metadata = {
  title: "Escolher plano · sclinic",
}

export default async function OnboardingPlanPage() {
  const session = await authService.getSession(await getAuthRequestContext())

  if (!session) {
    redirect(routes.login)
  }

  if (session.membership) {
    redirect(routes.dashboard)
  }

  return <PlanPicker />
}
