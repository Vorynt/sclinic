import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { AuthShell } from "@/modules/authentication/components/AuthShell"
import { authService } from "@/modules/authentication/services/auth.service"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { routes } from "@/config/routes"

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const session = await authService.getSession(await getAuthRequestContext())

  if (session?.user.mustChangePassword) {
    redirect(routes.changePassword)
  }

  return <AuthShell wide>{children}</AuthShell>
}
