"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { dashboardService } from "@/modules/dashboard/services/dashboard.service"
import type { OwnerHomeStats } from "@/modules/dashboard/types/home-stats"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getOwnerHomeStatsAction(): Promise<
  ApiResponse<OwnerHomeStats>
> {
  return toActionResult(async () =>
    dashboardService.getOwnerHomeStats(await getAuthRequestContext()),
  )
}
