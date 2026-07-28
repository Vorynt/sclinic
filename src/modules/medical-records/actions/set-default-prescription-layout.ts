"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { setDefaultPrescriptionLayoutSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionLayoutService } from "@/modules/medical-records/services/prescription-layout.service"
import type { PrescriptionLayout } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function setDefaultPrescriptionLayoutAction(
  data: unknown,
): Promise<ApiResponse<PrescriptionLayout>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(setDefaultPrescriptionLayoutSchema, data)
    return prescriptionLayoutService.setDefault(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
