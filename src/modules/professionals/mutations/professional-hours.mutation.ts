import { mutationOptions } from "@tanstack/react-query"

import { upsertProfessionalHoursAction } from "@/modules/professionals/actions/upsert-professional-hours"
import type { UpsertProfessionalHoursDto } from "@/modules/professionals/dto/upsert-professional-hours.dto"
import { unwrapActionResult } from "@/shared/errors"

export const professionalHoursMutationKeys = {
  upsert: ["professional-hours", "upsert"] as const,
}

export const professionalHoursMutations = {
  upsert: () =>
    mutationOptions({
      mutationKey: professionalHoursMutationKeys.upsert,
      mutationFn: async (data: UpsertProfessionalHoursDto) =>
        unwrapActionResult(await upsertProfessionalHoursAction(data)),
    }),
}
