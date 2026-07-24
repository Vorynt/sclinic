"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listPatientVitalSignsSchema } from "@/modules/medical-records/schemas/vital-signs.schema"
import { vitalSignsService } from "@/modules/medical-records/services/vital-signs.service"
import type { VitalSigns } from "@/modules/medical-records/types/vital-signs"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listPatientVitalSignsAction(
  data: unknown,
): Promise<ApiResponse<VitalSigns[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listPatientVitalSignsSchema, data)
    return vitalSignsService.listPatientHistory(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
