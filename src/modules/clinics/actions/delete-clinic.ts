"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import type { DeleteClinicResult } from "@/modules/clinics/dto/delete-clinic.dto"
import { deleteClinicSchema } from "@/modules/clinics/schemas/clinic.schema"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function deleteClinicAction(
  data: unknown,
): Promise<ApiResponse<DeleteClinicResult>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(deleteClinicSchema, data)
    return clinicService.delete(parsed, await getAuthRequestContext())
  })
}
