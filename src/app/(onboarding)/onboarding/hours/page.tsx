import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { routes } from "@/config/routes"
import { OnboardingHoursPanel } from "@/modules/clinics/components/OnboardingHoursPanel"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import { clinicHoursService } from "@/modules/clinics/services/clinic-hours.service"
import { Permission } from "@/config/permissions"
import { hasAllPermissions } from "@/core/permissions"

export const metadata: Metadata = {
  title: "Horários da clínica · sclinic",
}

export default async function OnboardingHoursPage() {
  const session = await authService.getSession(await getAuthRequestContext())

  if (!session) {
    redirect(routes.login)
  }

  if (!session.user.emailVerified) {
    redirect(routes.verifyEmail)
  }

  if (!session.membership || !session.session.activeClinicId) {
    redirect(routes.onboardingClinic)
  }

  if (!hasAllPermissions(session.permissions, [Permission.SETTINGS_MANAGE])) {
    redirect(routes.home)
  }

  const configured = await clinicHoursService.hasConfiguredHours(
    session.session.activeClinicId,
  )
  if (configured) {
    redirect(routes.home)
  }

  return <OnboardingHoursPanel />
}
