"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { clinicServiceIdSchema } from "@/modules/billing/schemas/clinic-service.schema"
import { clinicServiceService } from "@/modules/billing/services/clinic-service.service"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getClinicServiceAction(
  id: unknown,
): Promise<ApiResponse<ClinicService>> {
  return toActionResult(async () => {
    const parsedId = parseOrThrow(clinicServiceIdSchema, id)
    return clinicServiceService.getById(
      parsedId,
      await getAuthRequestContext(),
    )
  })
}
