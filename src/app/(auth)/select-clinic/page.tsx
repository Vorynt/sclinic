import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { routes } from "@/config/routes"
import { SelectClinicBlock } from "@/modules/authentication/components/SelectClinicBlock"
import { authService } from "@/modules/authentication/services/auth.service"
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"

export const metadata: Metadata = {
  title: "Selecionar clínica · sclinic",
  description: "Escolha a clínica com a qual deseja continuar",
}

type SelectClinicPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function SelectClinicPage({
  searchParams,
}: SelectClinicPageProps) {
  const ctx = await getAuthRequestContext()
  const session = await authService.getSession(ctx)

  if (!session) {
    redirect(routes.login)
  }

  if (!session.user.emailVerified) {
    redirect(routes.verifyEmail)
  }

  if (session.user.mustChangePassword) {
    redirect(routes.changePassword)
  }

  if (session.membership) {
    redirect(getPostAuthRedirect(session))
  }

  if (!session.needsClinicSelection) {
    redirect(getPostAuthRedirect(session))
  }

  const { next } = await searchParams
  const memberships = await authService.listMemberships(ctx)
  const clinics = memberships
    .filter((m) => m.status === "active" || m.status === "suspended")
    .map((m) => ({
      clinicId: m.clinicId,
      name: m.clinicName ?? "Clínica",
      roleName: m.roleName,
      status: m.status as "active" | "suspended",
    }))

  return <SelectClinicBlock clinics={clinics} next={next} />
}
