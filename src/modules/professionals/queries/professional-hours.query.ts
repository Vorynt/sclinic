import { queryOptions } from "@tanstack/react-query"

import { getProfessionalHoursAction } from "@/modules/professionals/actions/get-professional-hours"
import { unwrapActionResult } from "@/shared/errors"

export const professionalHoursQueryKeys = {
  all: ["professional-hours"] as const,
  detail: (professionalId: string) =>
    [...professionalHoursQueryKeys.all, professionalId] as const,
}

export const professionalHoursQueries = {
  detail: (professionalId: string) =>
    queryOptions({
      queryKey: professionalHoursQueryKeys.detail(professionalId),
      queryFn: async () =>
        unwrapActionResult(
          await getProfessionalHoursAction({ professionalId }),
        ),
      enabled: Boolean(professionalId),
    }),
}
