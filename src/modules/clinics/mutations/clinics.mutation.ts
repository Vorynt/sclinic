import { mutationOptions } from "@tanstack/react-query"

import { applyDefaultClinicHoursAction } from "@/modules/clinics/actions/apply-default-clinic-hours"
import { createClinicAction } from "@/modules/clinics/actions/create-clinic"
import { deleteClinicAction } from "@/modules/clinics/actions/delete-clinic"
import { updateClinicAction } from "@/modules/clinics/actions/update-clinic"
import { upsertClinicHoursAction } from "@/modules/clinics/actions/upsert-clinic-hours"
import type { DeleteClinicDto } from "@/modules/clinics/dto/delete-clinic.dto"
import type { UpdateClinicDto } from "@/modules/clinics/dto/update-clinic.dto"
import type { UpsertClinicHoursDto } from "@/modules/clinics/dto/upsert-clinic-hours.dto"
import type { CreateClinicInput } from "@/modules/clinics/schemas/clinic.schema"
import { unwrapActionResult } from "@/shared/errors"

export const clinicMutationKeys = {
  create: ["clinics", "create"] as const,
  update: ["clinics", "update"] as const,
  delete: ["clinics", "delete"] as const,
  upsertHours: ["clinics", "hours", "upsert"] as const,
  applyDefaultHours: ["clinics", "hours", "apply-default"] as const,
}

export const clinicMutations = {
  create: () =>
    mutationOptions({
      mutationKey: clinicMutationKeys.create,
      mutationFn: async (data: CreateClinicInput) =>
        unwrapActionResult(await createClinicAction(data)),
    }),

  update: () =>
    mutationOptions({
      mutationKey: clinicMutationKeys.update,
      mutationFn: async (data: UpdateClinicDto) =>
        unwrapActionResult(await updateClinicAction(data)),
    }),

  delete: () =>
    mutationOptions({
      mutationKey: clinicMutationKeys.delete,
      mutationFn: async (data: DeleteClinicDto) =>
        unwrapActionResult(await deleteClinicAction(data)),
    }),

  upsertHours: () =>
    mutationOptions({
      mutationKey: clinicMutationKeys.upsertHours,
      mutationFn: async (data: UpsertClinicHoursDto) =>
        unwrapActionResult(await upsertClinicHoursAction(data)),
    }),

  applyDefaultHours: () =>
    mutationOptions({
      mutationKey: clinicMutationKeys.applyDefaultHours,
      mutationFn: async () =>
        unwrapActionResult(await applyDefaultClinicHoursAction()),
    }),
}
