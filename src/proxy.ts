import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

import { routes } from "@/config/routes"

/**
 * Proxy Next.js 16 — optimistic auth redirects via session cookie presence.
 * Always re-validate with requireAuth / requireClinic on pages and actions.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  const isAuthRoute =
    pathname === routes.login ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/forgot-password")

  const isPublicRoute =
    pathname === routes.home ||
    pathname.startsWith("/api/auth") ||
    isAuthRoute

  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL(routes.login, request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL(routes.dashboard, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
