"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listActiveClinicServicesSchema } from "@/modules/billing/schemas/clinic-service.schema"
import { clinicServiceService } from "@/modules/billing/services/clinic-service.service"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listActiveClinicServicesAction(
  data: unknown = {},
): Promise<ApiResponse<ClinicService[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listActiveClinicServicesSchema, data ?? {})
    return clinicServiceService.listActive(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
