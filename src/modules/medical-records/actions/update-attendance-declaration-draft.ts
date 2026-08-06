"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { updateAttendanceDeclarationDraftSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import type { Prescription } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function updateAttendanceDeclarationDraftAction(
  data: unknown,
): Promise<ApiResponse<Prescription>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(updateAttendanceDeclarationDraftSchema, data)
    return prescriptionService.updateAttendanceDeclarationDraft(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
