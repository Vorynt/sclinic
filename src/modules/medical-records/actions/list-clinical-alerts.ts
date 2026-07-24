"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listClinicalAlertsSchema } from "@/modules/medical-records/schemas/clinical-alert.schema"
import { clinicalAlertService } from "@/modules/medical-records/services/clinical-alert.service"
import type { ClinicalAlert } from "@/modules/medical-records/types/clinical-alert"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listClinicalAlertsAction(
  data: unknown,
): Promise<ApiResponse<ClinicalAlert[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listClinicalAlertsSchema, data)
    return clinicalAlertService.listByPatient(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
