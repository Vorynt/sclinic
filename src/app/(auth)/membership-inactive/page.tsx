import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { routes } from "@/config/routes"
import { MembershipInactiveBlock } from "@/modules/authentication/components/MembershipInactiveBlock"
import { authService } from "@/modules/authentication/services/auth.service"
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"

export const metadata: Metadata = {
  title: "Acesso suspenso · sclinic",
  description: "Seu acesso à clínica está suspenso",
}

export default async function MembershipInactivePage() {
  const ctx = await getAuthRequestContext()
  const session = await authService.getSession(ctx)

  if (!session) {
    redirect(routes.login)
  }

  if (session.membership) {
    redirect(routes.dashboard)
  }

  if (!session.hasSuspendedMembershipOnly) {
    redirect(getPostAuthRedirect(session))
  }

  const memberships = await authService.listMemberships(ctx)
  const clinics = memberships
    .filter((m) => m.status === "suspended")
    .map((m) => ({
      id: m.clinicId,
      name: m.clinicName ?? "Clínica",
    }))

  return <MembershipInactiveBlock clinics={clinics} />
}
