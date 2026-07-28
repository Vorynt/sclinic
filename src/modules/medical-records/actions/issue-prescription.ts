"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { issuePrescriptionSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import type { Prescription } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function issuePrescriptionAction(
  data: unknown,
): Promise<ApiResponse<Prescription>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(issuePrescriptionSchema, data)
    return prescriptionService.issue(parsed, await getAuthRequestContext())
  })
}
