"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listPatientPrescriptionsSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import type { Prescription } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listPatientPrescriptionsAction(
  data: unknown,
): Promise<ApiResponse<Prescription[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listPatientPrescriptionsSchema, data)
    return prescriptionService.listPatientHistory(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
