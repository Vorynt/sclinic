import { routes } from "@/config/routes"

const LEGAL_PATHS = [
  routes.legal,
  routes.terms,
  routes.privacy,
  routes.cookies,
  routes.saasAgreement,
  routes.dpa,
  routes.security,
  routes.retention,
  routes.incidents,
  routes.ropa,
] as const

const AUTH_ENTRY_PATHS = [
  routes.login,
  routes.signUp,
  routes.forgotPassword,
  routes.twoFactor,
] as const

/**
 * Guest-only auth entry (login, sign-up, 2FA challenge, reset).
 * Proxy must not bounce these based on cookie presence — pages validate the
 * real session to avoid TOO_MANY_REDIRECTS with a stale cookie.
 */
export function isAuthEntryPath(pathname: string): boolean {
  return (
    AUTH_ENTRY_PATHS.some((path) => pathname === path) ||
    pathname.startsWith(routes.resetPassword)
  )
}

export function isPublicPath(pathname: string): boolean {
  if (pathname === routes.landing) {
    return true
  }

  if (LEGAL_PATHS.some((path) => pathname === path)) {
    return true
  }

  if (pathname === routes.invite) {
    return true
  }

  if (
    pathname === routes.professionalInvite ||
    pathname.startsWith(routes.professionalInvite)
  ) {
    return true
  }

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/stripe/webhook")
  ) {
    return true
  }

  return isAuthEntryPath(pathname)
}
