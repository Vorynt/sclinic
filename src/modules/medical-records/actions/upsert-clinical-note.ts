"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { upsertClinicalNoteSchema } from "@/modules/medical-records/schemas/clinical-note.schema"
import { clinicalNoteService } from "@/modules/medical-records/services/clinical-note.service"
import type { ClinicalNote } from "@/modules/medical-records/types/clinical-note"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function upsertClinicalNoteAction(
  data: unknown,
): Promise<ApiResponse<ClinicalNote>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(upsertClinicalNoteSchema, data)
    return clinicalNoteService.upsert(parsed, await getAuthRequestContext())
  })
}
