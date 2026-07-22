import { mutationOptions } from "@tanstack/react-query"

import { createClinicAction } from "@/modules/clinics/actions/create-clinic"
import type { CreateClinicDto } from "@/modules/clinics/dto/create-clinic.dto"
import { unwrapActionResult } from "@/shared/errors"

export const clinicMutationKeys = {
  create: ["clinics", "create"] as const,
}

export const clinicMutations = {
  create: () =>
    mutationOptions({
      mutationKey: clinicMutationKeys.create,
      mutationFn: async (data: CreateClinicDto) =>
        unwrapActionResult(await createClinicAction(data)),
    }),
}
