"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { saveAndIssueMedicalCertificateSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import type { Prescription } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

/**
 * Create or update medical certificate draft, then issue in one round-trip.
 */
export async function saveAndIssueMedicalCertificateAction(
  data: unknown,
): Promise<ApiResponse<Prescription>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(saveAndIssueMedicalCertificateSchema, data)
    const ctx = await getAuthRequestContext()

    const draft = parsed.id
      ? await prescriptionService.updateMedicalCertificateDraft(
          {
            id: parsed.id,
            daysOff: parsed.daysOff,
            cid: parsed.cid,
            notes: parsed.notes,
          },
          ctx,
        )
      : await prescriptionService.createMedicalCertificate(
          {
            appointmentId: parsed.appointmentId,
            daysOff: parsed.daysOff,
            cid: parsed.cid,
            notes: parsed.notes,
          },
          ctx,
        )

    return prescriptionService.issue({ id: draft.id }, ctx)
  })
}
