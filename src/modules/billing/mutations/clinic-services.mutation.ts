import { mutationOptions } from "@tanstack/react-query"

import { createClinicServiceAction } from "@/modules/billing/actions/create-clinic-service"
import { deleteClinicServiceAction } from "@/modules/billing/actions/delete-clinic-service"
import { updateClinicServiceAction } from "@/modules/billing/actions/update-clinic-service"
import type { CreateClinicServiceDto } from "@/modules/billing/dto/create-clinic-service.dto"
import type { UpdateClinicServiceDto } from "@/modules/billing/dto/update-clinic-service.dto"
import { unwrapActionResult } from "@/shared/errors"

export const clinicServicesMutationKeys = {
  create: ["clinic-services", "create"] as const,
  update: ["clinic-services", "update"] as const,
  delete: ["clinic-services", "delete"] as const,
}

export const clinicServicesMutations = {
  create: () =>
    mutationOptions({
      mutationKey: clinicServicesMutationKeys.create,
      mutationFn: async (data: CreateClinicServiceDto) =>
        unwrapActionResult(await createClinicServiceAction(data)),
    }),

  update: () =>
    mutationOptions({
      mutationKey: clinicServicesMutationKeys.update,
      mutationFn: async (data: UpdateClinicServiceDto) =>
        unwrapActionResult(await updateClinicServiceAction(data)),
    }),

  delete: () =>
    mutationOptions({
      mutationKey: clinicServicesMutationKeys.delete,
      mutationFn: async (id: string) =>
        unwrapActionResult(await deleteClinicServiceAction(id)),
    }),
}
