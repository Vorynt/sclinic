"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listClinicServicesSchema } from "@/modules/billing/schemas/clinic-service.schema"
import { clinicServiceService } from "@/modules/billing/services/clinic-service.service"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"
import type { PaginatedResult } from "@/types/pagination"

export async function listClinicServicesAction(
  data: unknown = {},
): Promise<ApiResponse<PaginatedResult<ClinicService>>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listClinicServicesSchema, data ?? {})
    return clinicServiceService.list(parsed, await getAuthRequestContext())
  })
}
