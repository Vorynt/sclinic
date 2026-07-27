import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { routes } from "@/config/routes"
import { authService } from "@/modules/authentication/services/auth.service"
import { USERS_CONSTANTS } from "@/modules/users/constants/users"

type OwnerProviderProps = {
  children: ReactNode
  /** Rendered when authenticated but not the clinic owner. */
  fallback: ReactNode
  /**
   * Rendered when there is no session.
   * If omitted, redirects to the login route.
   */
  unauthenticatedFallback?: ReactNode
}

/**
 * Server layout gate: only the active clinic owner may render children.
 */
export async function OwnerProvider({
  children,
  fallback,
  unauthenticatedFallback,
}: OwnerProviderProps) {
  const session = await authService.getSession({
    headers: await headers(),
  })

  if (!session) {
    if (unauthenticatedFallback !== undefined) {
      return unauthenticatedFallback
    }
    redirect(routes.login)
  }

  if (
    !session.membership ||
    session.membership.roleKey !== USERS_CONSTANTS.OWNER_ROLE_KEY
  ) {
    return fallback
  }

  return children
}
