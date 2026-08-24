"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { dashboardService } from "@/modules/dashboard/services/dashboard.service"
import type { AdminHomeStats } from "@/modules/dashboard/types/home-stats"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getAdminHomeStatsAction(): Promise<
  ApiResponse<AdminHomeStats>
> {
  return toActionResult(async () =>
    dashboardService.getAdminHomeStats(await getAuthRequestContext()),
  )
}
