import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

import { routes } from "@/config/routes"
import { isPublicPath } from "@/modules/authentication/utils/route-access"

/**
 * Proxy Next.js 16 — optimistic one-way gate via session cookie presence.
 * Cookie absent + private path → login. Cookie present is never bounced from
 * auth entry pages here: those pages validate the real session (stale cookies
 * would otherwise loop login ↔ home). Always re-validate with requireAuth /
 * requireClinic on pages and actions.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie && !isPublicPath(pathname)) {
    const loginUrl = new URL(routes.login, request.url)
    loginUrl.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\..*).*)",
  ],
}
