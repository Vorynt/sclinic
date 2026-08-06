"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listWaitlistSchema } from "@/modules/appointments/schemas/waitlist.schema"
import { waitlistService } from "@/modules/appointments/services/waitlist.service"
import type { WaitlistEntry } from "@/modules/appointments/types/waitlist"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listWaitlistAction(
  data: unknown,
): Promise<ApiResponse<WaitlistEntry[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listWaitlistSchema, data ?? {})
    return waitlistService.list(parsed, await getAuthRequestContext())
  })
}
