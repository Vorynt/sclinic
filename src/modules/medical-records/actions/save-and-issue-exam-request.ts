"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { saveAndIssueExamRequestSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import type { Prescription } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

/**
 * Create or update exam request draft, then issue in one round-trip.
 */
export async function saveAndIssueExamRequestAction(
  data: unknown,
): Promise<ApiResponse<Prescription>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(saveAndIssueExamRequestSchema, data)
    const ctx = await getAuthRequestContext()

    const draft = parsed.id
      ? await prescriptionService.updateExamRequestDraft(
          {
            id: parsed.id,
            exams: parsed.exams,
            notes: parsed.notes,
          },
          ctx,
        )
      : await prescriptionService.createExamRequest(
          {
            appointmentId: parsed.appointmentId,
            exams: parsed.exams,
            notes: parsed.notes,
          },
          ctx,
        )

    return prescriptionService.issue({ id: draft.id }, ctx)
  })
}
