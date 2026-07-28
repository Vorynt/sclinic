"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listAppointmentPrescriptionsSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import type { PrescriptionsForAppointment } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listAppointmentPrescriptionsAction(
  data: unknown,
): Promise<ApiResponse<PrescriptionsForAppointment>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listAppointmentPrescriptionsSchema, data)
    return prescriptionService.listForAppointment(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
