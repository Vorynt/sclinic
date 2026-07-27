"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import { billingService } from "@/modules/billing/services/billing.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function hasLivingSubscriptionAction(): Promise<
  ApiResponse<boolean>
> {
  return toActionResult(async () => {
    const authContext = await authService.requireSession(
      await getAuthRequestContext(),
    )
    return billingService.hasLivingSubscription(authContext.user.id)
  })
}
