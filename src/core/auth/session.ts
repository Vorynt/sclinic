import { headers as nextHeaders } from "next/headers"

import { auth } from "@/core/auth/auth"
import type { AuthRequestContext } from "@/shared/auth"

/**
 * Reads the Better Auth session for the current request.
 * Prefer passing explicit headers from actions when available.
 */
export async function getSession(ctx?: AuthRequestContext) {
  const requestHeaders = ctx?.headers ?? (await nextHeaders())
  return auth.api.getSession({ headers: requestHeaders })
}

export async function getSessionOrNull(ctx?: AuthRequestContext) {
  try {
    return await getSession(ctx)
  } catch {
    return null
  }
}
