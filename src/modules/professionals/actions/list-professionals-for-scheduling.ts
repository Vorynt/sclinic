"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { ProfessionalSchedulingItem } from "@/modules/professionals/types/professional"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function listProfessionalsForSchedulingAction(): Promise<
  ApiResponse<ProfessionalSchedulingItem[]>
> {
  return toActionResult(async () =>
    professionalService.listForScheduling(await getAuthRequestContext()),
  )
}
