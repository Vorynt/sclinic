"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { exportChargesSchema } from "@/modules/billing/schemas/charge.schema"
import { chargeService } from "@/modules/billing/services/charge.service"
import type { ChargeExportList } from "@/modules/billing/types/charge"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listExportChargesAction(
  data: unknown = {},
): Promise<ApiResponse<ChargeExportList>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(exportChargesSchema, data ?? {})
    return chargeService.listForExport(parsed, await getAuthRequestContext())
  })
}
