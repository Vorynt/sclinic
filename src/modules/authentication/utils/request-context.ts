import { headers } from "next/headers"

import type { AuthRequestContext } from "@/shared/auth"

/** Builds AuthRequestContext from the current Next.js request headers. */
export async function getAuthRequestContext(): Promise<AuthRequestContext> {
  return { headers: await headers() }
}
