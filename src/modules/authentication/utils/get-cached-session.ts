import { cache } from "react"
import { headers } from "next/headers"

import { authService } from "@/modules/authentication/services/auth.service"
import type { AuthContext } from "@/modules/authentication/types/auth"

/**
 * Per-request memoization of getSession for RSC layouts.
 * Root + segment layouts share one DB/auth round-trip per HTTP request.
 */
export const getCachedSession = cache(async (): Promise<AuthContext | null> => {
  return authService.getSession({ headers: await headers() })
})
