"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { deletePrescriptionDraftSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function deletePrescriptionDraftAction(
  data: unknown,
): Promise<ApiResponse<void>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(deletePrescriptionDraftSchema, data)
    await prescriptionService.deleteDraft(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
