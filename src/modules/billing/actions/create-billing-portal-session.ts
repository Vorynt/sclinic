"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import { billingService } from "@/modules/billing/services/billing.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function createBillingPortalSessionAction(): Promise<
  ApiResponse<{ url: string }>
> {
  return toActionResult(async () => {
    const authContext = await authService.requireSession(
      await getAuthRequestContext(),
    )
    return billingService.createBillingPortalSession({
      userId: authContext.user.id,
    })
  })
}
