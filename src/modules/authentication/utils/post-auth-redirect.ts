import { routes } from "@/config/routes"
import type { AuthContext } from "@/modules/authentication/types/auth"

/**
 * Destination after sign-in / sign-up / email verification.
 * Unverified users are blocked before onboarding or dashboard.
 */
export function getPostAuthRedirect(auth: AuthContext): string {
  if (!auth.user.emailVerified) {
    return routes.verifyEmail
  }

  if (!auth.membership) {
    return routes.onboardingPlan
  }

  return routes.dashboard
}
