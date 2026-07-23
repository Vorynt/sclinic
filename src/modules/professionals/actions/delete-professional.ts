"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { deleteProfessionalSchema } from "@/modules/professionals/schemas/professional.schema"
import { professionalService } from "@/modules/professionals/services/professional.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function deleteProfessionalAction(
  data: unknown,
): Promise<ApiResponse<void>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(deleteProfessionalSchema, data)
    return professionalService.delete(parsed.id, await getAuthRequestContext())
  })
}
