"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { createClinicServiceSchema } from "@/modules/billing/schemas/clinic-service.schema"
import { clinicServiceService } from "@/modules/billing/services/clinic-service.service"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function createClinicServiceAction(
  data: unknown,
): Promise<ApiResponse<ClinicService>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(createClinicServiceSchema, data)
    return clinicServiceService.create(parsed, await getAuthRequestContext())
  })
}
