"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { saveAndIssueAttendanceDeclarationSchema } from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import type { Prescription } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

/**
 * Create or update attendance declaration draft, then issue in one round-trip.
 */
export async function saveAndIssueAttendanceDeclarationAction(
  data: unknown,
): Promise<ApiResponse<Prescription>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(saveAndIssueAttendanceDeclarationSchema, data)
    const ctx = await getAuthRequestContext()

    const draft = parsed.id
      ? await prescriptionService.updateAttendanceDeclarationDraft(
          { id: parsed.id, notes: parsed.notes },
          ctx,
        )
      : await prescriptionService.createAttendanceDeclaration(
          { appointmentId: parsed.appointmentId, notes: parsed.notes },
          ctx,
        )

    return prescriptionService.issue({ id: draft.id }, ctx)
  })
}
