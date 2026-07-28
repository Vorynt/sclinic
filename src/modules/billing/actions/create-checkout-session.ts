"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import { createCheckoutSessionSchema } from "@/modules/billing/schemas/checkout.schema"
import { billingService } from "@/modules/billing/services/billing.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function createCheckoutSessionAction(
  data: unknown,
): Promise<ApiResponse<{ url: string }>> {
  return toActionResult(async () => {
    const authContext = await authService.requireSession(
      await getAuthRequestContext(),
    )
    const parsed = parseOrThrow(createCheckoutSessionSchema, data)

    return billingService.createCheckoutSession({
      userId: authContext.user.id,
      email: authContext.user.email,
      name: authContext.user.name,
      planId: parsed.planId,
      successPath: parsed.successPath,
      cancelPath: parsed.cancelPath,
    })
  })
}
