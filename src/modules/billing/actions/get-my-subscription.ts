"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import { billingService } from "@/modules/billing/services/billing.service"
import type { SubscriptionWithPlan } from "@/modules/billing/types/billing"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getMySubscriptionAction(): Promise<
  ApiResponse<SubscriptionWithPlan | null>
> {
  return toActionResult(async () => {
    const authContext = await authService.requireSession(
      await getAuthRequestContext(),
    )
    return billingService.getSubscriptionForUser(authContext.user.id)
  })
}
