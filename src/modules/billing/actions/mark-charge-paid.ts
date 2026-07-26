"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { markChargePaidSchema } from "@/modules/billing/schemas/charge.schema"
import { chargeService } from "@/modules/billing/services/charge.service"
import type { Charge } from "@/modules/billing/types/charge"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function markChargePaidAction(
  data: unknown,
): Promise<ApiResponse<Charge>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(markChargePaidSchema, data)
    return chargeService.markPaid(parsed, await getAuthRequestContext())
  })
}
