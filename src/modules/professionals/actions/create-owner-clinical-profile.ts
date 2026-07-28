"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { createOwnerClinicalProfileSchema } from "@/modules/professionals/schemas/owner-clinical-profile.schema"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { ProfessionalListItem } from "@/modules/professionals/types/professional"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function createOwnerClinicalProfileAction(
  data: unknown,
): Promise<ApiResponse<ProfessionalListItem>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(createOwnerClinicalProfileSchema, data)
    return professionalService.createOwnerClinicalProfile(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
