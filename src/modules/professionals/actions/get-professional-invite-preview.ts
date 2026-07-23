"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { professionalInviteTokenSchema } from "@/modules/professionals/schemas/professional.schema"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { ProfessionalInvitePreview } from "@/modules/professionals/types/professional"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getProfessionalInvitePreviewAction(
  data: unknown,
): Promise<ApiResponse<ProfessionalInvitePreview>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(professionalInviteTokenSchema, data)
    return professionalService.getInvitePreview(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
