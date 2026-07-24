"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listPatientClinicalNotesSchema } from "@/modules/medical-records/schemas/clinical-note.schema"
import { clinicalNoteService } from "@/modules/medical-records/services/clinical-note.service"
import type { ClinicalNote } from "@/modules/medical-records/types/clinical-note"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listPatientClinicalNotesAction(
  data: unknown,
): Promise<ApiResponse<ClinicalNote[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listPatientClinicalNotesSchema, data)
    return clinicalNoteService.listPatientHistory(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
