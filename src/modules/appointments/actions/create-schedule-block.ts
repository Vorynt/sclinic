"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { createScheduleBlockSchema } from "@/modules/appointments/schemas/schedule-block.schema"
import { scheduleBlockService } from "@/modules/appointments/services/schedule-block.service"
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function createScheduleBlockAction(
  data: unknown,
): Promise<ApiResponse<ScheduleBlock>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(createScheduleBlockSchema, data)
    return scheduleBlockService.create(parsed, await getAuthRequestContext())
  })
}
