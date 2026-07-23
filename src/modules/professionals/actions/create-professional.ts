"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { createProfessionalSchema } from "@/modules/professionals/schemas/professional.schema"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { ProfessionalListItem } from "@/modules/professionals/types/professional"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function createProfessionalAction(
  data: unknown,
): Promise<ApiResponse<ProfessionalListItem>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(createProfessionalSchema, data)
    return professionalService.create(parsed, await getAuthRequestContext())
  })
}
