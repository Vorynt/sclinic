"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { professionalInviteTokenSchema } from "@/modules/professionals/schemas/professional.schema"
import { professionalService } from "@/modules/professionals/services/professional.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function acceptProfessionalInviteAction(
  data: unknown,
): Promise<ApiResponse<{ success: true }>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(professionalInviteTokenSchema, data)
    return professionalService.acceptInvite(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
