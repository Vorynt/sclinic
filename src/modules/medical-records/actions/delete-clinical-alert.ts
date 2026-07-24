"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { deleteClinicalAlertSchema } from "@/modules/medical-records/schemas/clinical-alert.schema"
import { clinicalAlertService } from "@/modules/medical-records/services/clinical-alert.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function deleteClinicalAlertAction(
  data: unknown,
): Promise<ApiResponse<void>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(deleteClinicalAlertSchema, data)
    return clinicalAlertService.softDelete(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
