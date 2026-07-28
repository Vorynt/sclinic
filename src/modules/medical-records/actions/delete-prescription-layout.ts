"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { deletePrescriptionLayoutSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionLayoutService } from "@/modules/medical-records/services/prescription-layout.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function deletePrescriptionLayoutAction(
  data: unknown,
): Promise<ApiResponse<void>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(deletePrescriptionLayoutSchema, data)
    await prescriptionLayoutService.delete(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
