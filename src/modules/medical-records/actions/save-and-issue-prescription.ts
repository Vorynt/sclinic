"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import {
  createPrescriptionSchema,
  issuePrescriptionSchema,
} from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import type { Prescription } from "@/modules/medical-records/types/prescription"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"
import { z } from "zod"

const saveAndIssueSchema = createPrescriptionSchema.extend({
  id: issuePrescriptionSchema.shape.id.optional(),
})

/**
 * Create or update draft, then issue in one round-trip (modal primary CTA).
 */
export async function saveAndIssuePrescriptionAction(
  data: unknown,
): Promise<ApiResponse<Prescription>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(saveAndIssueSchema, data)
    const ctx = await getAuthRequestContext()

    const draft = parsed.id
      ? await prescriptionService.updateDraft(
          {
            id: parsed.id,
            body: parsed.body,
            plainText: parsed.plainText,
          },
          ctx,
        )
      : await prescriptionService.create(
          {
            appointmentId: parsed.appointmentId,
            body: parsed.body,
            plainText: parsed.plainText,
          },
          ctx,
        )

    return prescriptionService.issue({ id: draft.id }, ctx)
  })
}

export type SaveAndIssuePrescriptionDto = z.infer<typeof saveAndIssueSchema>
