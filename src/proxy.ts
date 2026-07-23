import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

import { routes } from "@/config/routes"

/**
 * Proxy Next.js 16 — optimistic auth redirects via session cookie presence.
 * Always re-validate with requireAuth / requireClinic on pages and actions.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  const isAuthRoute =
    pathname === routes.login ||
    pathname === routes.signUp ||
    pathname === routes.forgotPassword ||
    pathname.startsWith("/reset-password")

  const isPublicRoute =
    pathname === routes.landing ||
    pathname === routes.invite ||
    pathname === routes.professionalInvite ||
    pathname.startsWith(routes.professionalInvite) ||
    pathname.startsWith("/api/auth") ||
    isAuthRoute

  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL(routes.login, request.url)
    loginUrl.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  // Cookie present on auth pages → app entry; pages decide onboarding vs home.
  // /verify-email, /change-password and /invite are intentionally excluded.
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL(routes.home, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
