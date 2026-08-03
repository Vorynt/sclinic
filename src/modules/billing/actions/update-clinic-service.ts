"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { updateClinicServiceSchema } from "@/modules/billing/schemas/clinic-service.schema"
import { clinicServiceService } from "@/modules/billing/services/clinic-service.service"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function updateClinicServiceAction(
  data: unknown,
): Promise<ApiResponse<ClinicService>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(updateClinicServiceSchema, data)
    return clinicServiceService.update(parsed, await getAuthRequestContext())
  })
}
