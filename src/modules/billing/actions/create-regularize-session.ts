"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import { createRegularizeSessionSchema } from "@/modules/billing/schemas/regularize.schema"
import { billingService } from "@/modules/billing/services/billing.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function createRegularizeSessionAction(
  data: unknown = {},
): Promise<ApiResponse<{ url: string }>> {
  return toActionResult(async () => {
    const authContext = await authService.requireSession(
      await getAuthRequestContext(),
    )
    const parsed = parseOrThrow(createRegularizeSessionSchema, data ?? {})

    return billingService.createRegularizeSession({
      userId: authContext.user.id,
      email: authContext.user.email,
      name: authContext.user.name,
      planId: parsed.planId,
      successPath: parsed.successPath,
      cancelPath: parsed.cancelPath,
    })
  })
}
