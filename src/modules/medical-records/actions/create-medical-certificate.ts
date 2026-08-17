"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { createMedicalCertificateSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import type { Prescription } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function createMedicalCertificateAction(
  data: unknown,
): Promise<ApiResponse<Prescription>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(createMedicalCertificateSchema, data)
    return prescriptionService.createMedicalCertificate(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
