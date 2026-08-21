"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { exportChargesSchema } from "@/modules/billing/schemas/charge.schema"
import { chargeService } from "@/modules/billing/services/charge.service"
import type { ChargesExport } from "@/modules/billing/types/charge"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function exportChargesAction(
  data: unknown = {},
): Promise<ApiResponse<ChargesExport>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(exportChargesSchema, data ?? {})
    return chargeService.exportCsv(parsed, await getAuthRequestContext())
  })
}
