import { mutationOptions } from "@tanstack/react-query"

import { upsertVitalSignsAction } from "@/modules/medical-records/actions/upsert-vital-signs"
import type { UpsertVitalSignsDto } from "@/modules/medical-records/dto/upsert-vital-signs.dto"
import { unwrapActionResult } from "@/shared/errors"

export const vitalSignsMutationKeys = {
  upsert: ["vital-signs", "upsert"] as const,
}

export const vitalSignsMutations = {
  upsert: () =>
    mutationOptions({
      mutationKey: vitalSignsMutationKeys.upsert,
      mutationFn: async (data: UpsertVitalSignsDto) =>
        unwrapActionResult(await upsertVitalSignsAction(data)),
    }),
}
