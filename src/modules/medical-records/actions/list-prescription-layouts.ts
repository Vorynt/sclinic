"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { prescriptionLayoutService } from "@/modules/medical-records/services/prescription-layout.service"
import type { PrescriptionLayout } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export type PrescriptionLayoutsSettingsPayload = {
  templates: PrescriptionLayout[]
  systemDefaultHtml: string
  maxTemplates: number
}

export async function listPrescriptionLayoutsAction(): Promise<
  ApiResponse<PrescriptionLayoutsSettingsPayload>
> {
  return toActionResult(async () =>
    prescriptionLayoutService.listForSettings(await getAuthRequestContext()),
  )
}
