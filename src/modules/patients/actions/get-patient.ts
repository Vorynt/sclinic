"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { patientIdSchema } from "@/modules/patients/schemas/patient.schema"
import { patientService } from "@/modules/patients/services/patient.service"
import type { Patient } from "@/modules/patients/types/patient"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getPatientAction(
  id: unknown,
): Promise<ApiResponse<Patient>> {
  return toActionResult(async () => {
    const parsedId = parseOrThrow(patientIdSchema, id)
    return patientService.getById(parsedId, await getAuthRequestContext())
  })
}
