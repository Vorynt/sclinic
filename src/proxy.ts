import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/**
 * Proxy Next.js 16 (ex-middleware) — autenticação / rotas protegidas na Fase 2.
 * @see architecture e docs Next: file convention `proxy.ts`
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
