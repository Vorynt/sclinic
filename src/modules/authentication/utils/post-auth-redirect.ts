import { routes } from "@/config/routes"
import type { AuthContext } from "@/modules/authentication/types/auth"

/**
 * Destination after sign-in / sign-up / email verification.
 * Unverified users are blocked before onboarding or dashboard.
 * Optional `next` (relative path) is honored when safe — e.g. invite accept.
 */
export function getSafeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return null
  }
  return next
}

function withNext(path: string, next: string | null): string {
  if (!next || next.startsWith(routes.changePassword)) {
    return path
  }
  const url = new URL(path, "http://local")
  url.searchParams.set("next", next)
  return `${url.pathname}${url.search}`
}

export function getPostAuthRedirect(
  auth: AuthContext,
  next?: string | null,
): string {
  if (!auth.user.emailVerified) {
    return routes.verifyEmail
  }

  const safeNext = getSafeNextPath(next)

  if (auth.user.mustChangePassword) {
    return withNext(routes.changePassword, safeNext)
  }

  // Invite acceptance must work before the user has a membership.
  if (safeNext?.startsWith(routes.invite)) {
    return safeNext
  }

  if (!auth.membership) {
    return routes.onboardingPlan
  }

  return safeNext ?? routes.dashboard
}
