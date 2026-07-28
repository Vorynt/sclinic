"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { prescriptionLayoutService } from "@/modules/medical-records/services/prescription-layout.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function resetPrescriptionLayoutAction(): Promise<
  ApiResponse<void>
> {
  return toActionResult(async () => {
    await prescriptionLayoutService.resetToDefault(
      await getAuthRequestContext(),
    )
  })
}
