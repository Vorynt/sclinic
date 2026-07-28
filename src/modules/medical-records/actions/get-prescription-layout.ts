"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { prescriptionLayoutService } from "@/modules/medical-records/services/prescription-layout.service"
import type { PrescriptionLayoutSource } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getPrescriptionLayoutAction(): Promise<
  ApiResponse<PrescriptionLayoutSource>
> {
  return toActionResult(async () =>
    prescriptionLayoutService.getForSettings(await getAuthRequestContext()),
  )
}
