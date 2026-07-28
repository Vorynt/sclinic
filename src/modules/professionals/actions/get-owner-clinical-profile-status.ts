"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { professionalService } from "@/modules/professionals/services/professional.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getOwnerClinicalProfileStatusAction(): Promise<
  ApiResponse<{ hasProfile: boolean }>
> {
  return toActionResult(async () =>
    professionalService.hasOwnerClinicalProfile(await getAuthRequestContext()),
  )
}
