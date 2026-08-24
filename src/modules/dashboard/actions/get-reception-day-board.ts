"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { receptionDayBoardSchema } from "@/modules/dashboard/schemas/home-stats.schema"
import { dashboardService } from "@/modules/dashboard/services/dashboard.service"
import type { ReceptionDayBoard } from "@/modules/dashboard/types/home-stats"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getReceptionDayBoardAction(
  data: unknown,
): Promise<ApiResponse<ReceptionDayBoard>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(receptionDayBoardSchema, data)
    return dashboardService.getReceptionDayBoard(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
