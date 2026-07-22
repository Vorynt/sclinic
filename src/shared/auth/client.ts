import { createAuthClient } from "better-auth/react"

/**
 * Browser auth client for future UI.
 * Server flows must use Server Actions + authService / guards.
 */
export const authClient = createAuthClient()
