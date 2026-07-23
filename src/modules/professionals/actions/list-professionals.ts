"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { ProfessionalListItem } from "@/modules/professionals/types/professional"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function listProfessionalsAction(): Promise<
  ApiResponse<ProfessionalListItem[]>
> {
  return toActionResult(async () =>
    professionalService.list(await getAuthRequestContext()),
  )
}
