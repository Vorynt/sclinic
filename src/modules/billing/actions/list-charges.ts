"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listChargesSchema } from "@/modules/billing/schemas/charge.schema"
import { chargeService } from "@/modules/billing/services/charge.service"
import type { ChargeListItem } from "@/modules/billing/types/charge"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"
import type { PaginatedResult } from "@/types/pagination"

export async function listChargesAction(
  data: unknown = {},
): Promise<ApiResponse<PaginatedResult<ChargeListItem>>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listChargesSchema, data ?? {})
    return chargeService.list(parsed, await getAuthRequestContext())
  })
}
