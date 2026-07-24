import { mutationOptions } from "@tanstack/react-query"

import { upsertClinicalNoteAction } from "@/modules/medical-records/actions/upsert-clinical-note"
import type { UpsertClinicalNoteDto } from "@/modules/medical-records/dto/upsert-clinical-note.dto"
import { unwrapActionResult } from "@/shared/errors"

export const clinicalNotesMutationKeys = {
  upsert: ["clinical-notes", "upsert"] as const,
}

export const clinicalNotesMutations = {
  upsert: () =>
    mutationOptions({
      mutationKey: clinicalNotesMutationKeys.upsert,
      mutationFn: async (data: UpsertClinicalNoteDto) =>
        unwrapActionResult(await upsertClinicalNoteAction(data)),
    }),
}
