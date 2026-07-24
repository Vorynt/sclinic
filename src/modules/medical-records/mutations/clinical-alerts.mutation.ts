import { mutationOptions } from "@tanstack/react-query"

import { createClinicalAlertAction } from "@/modules/medical-records/actions/create-clinical-alert"
import { deleteClinicalAlertAction } from "@/modules/medical-records/actions/delete-clinical-alert"
import type { CreateClinicalAlertDto } from "@/modules/medical-records/dto/create-clinical-alert.dto"
import type { DeleteClinicalAlertDto } from "@/modules/medical-records/dto/delete-clinical-alert.dto"
import { unwrapActionResult } from "@/shared/errors"

export const clinicalAlertsMutationKeys = {
  create: ["clinical-alerts", "create"] as const,
  delete: ["clinical-alerts", "delete"] as const,
}

export const clinicalAlertsMutations = {
  create: () =>
    mutationOptions({
      mutationKey: clinicalAlertsMutationKeys.create,
      mutationFn: async (data: CreateClinicalAlertDto) =>
        unwrapActionResult(await createClinicalAlertAction(data)),
    }),

  delete: () =>
    mutationOptions({
      mutationKey: clinicalAlertsMutationKeys.delete,
      mutationFn: async (data: DeleteClinicalAlertDto) =>
        unwrapActionResult(await deleteClinicalAlertAction(data)),
    }),
}
