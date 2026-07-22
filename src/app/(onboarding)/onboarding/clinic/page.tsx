import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { routes } from "@/config/routes"
import { CreateClinicForm } from "@/modules/clinics/components/CreateClinicForm"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"

export const metadata: Metadata = {
  title: "Criar clínica · sclinic",
}

type OnboardingClinicPageProps = {
  searchParams: Promise<{ planId?: string }>
}

export default async function OnboardingClinicPage({
  searchParams,
}: OnboardingClinicPageProps) {
  const session = await authService.getSession(await getAuthRequestContext())

  if (!session) {
    redirect(routes.login)
  }

  if (session.membership) {
    redirect(routes.dashboard)
  }

  const { planId } = await searchParams

  if (!planId) {
    redirect(routes.onboardingPlan)
  }

  return <CreateClinicForm planId={planId} />
}
