"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { chargeService } from "@/modules/billing/services/charge.service"
import type { BillingSummary } from "@/modules/billing/types/charge"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getBillingSummaryAction(): Promise<
  ApiResponse<BillingSummary>
> {
  return toActionResult(async () => {
    return chargeService.getSummary(await getAuthRequestContext())
  })
}
