"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listClinicsByIdsSchema } from "@/modules/clinics/schemas/clinic.schema"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import type { Clinic } from "@/modules/clinics/types/clinic"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listClinicsByIdsAction(
  data: unknown,
): Promise<ApiResponse<Clinic[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listClinicsByIdsSchema, data)
    return clinicService.listByIds(
      parsed.clinicIds,
      await getAuthRequestContext(),
    )
  })
}
