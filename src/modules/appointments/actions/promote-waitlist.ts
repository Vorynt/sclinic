"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { promoteWaitlistSchema } from "@/modules/appointments/schemas/waitlist.schema"
import { waitlistService } from "@/modules/appointments/services/waitlist.service"
import type { WaitlistEntry } from "@/modules/appointments/types/waitlist"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function promoteWaitlistAction(
  data: unknown,
): Promise<ApiResponse<WaitlistEntry>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(promoteWaitlistSchema, data)
    return waitlistService.promote(parsed, await getAuthRequestContext())
  })
}
