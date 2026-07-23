"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { professionalIdSchema } from "@/modules/professionals/schemas/professional.schema"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { ProfessionalListItem } from "@/modules/professionals/types/professional"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getProfessionalAction(
  id: unknown,
): Promise<ApiResponse<ProfessionalListItem>> {
  return toActionResult(async () => {
    const parsedId = parseOrThrow(professionalIdSchema, id)
    return professionalService.getById(
      parsedId,
      await getAuthRequestContext(),
    )
  })
}
