"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listProfessionalsForSchedulingSchema } from "@/modules/professionals/schemas/professional.schema"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { ProfessionalSchedulingItem } from "@/modules/professionals/types/professional"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listProfessionalsForSchedulingAction(
  data: unknown = {},
): Promise<ApiResponse<ProfessionalSchedulingItem[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(
      listProfessionalsForSchedulingSchema,
      data ?? {},
    )
    return professionalService.listForScheduling(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
