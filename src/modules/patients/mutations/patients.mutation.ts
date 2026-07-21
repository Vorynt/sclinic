import { mutationOptions } from "@tanstack/react-query"

import { createPatientAction } from "@/modules/patients/actions/create-patient"
import { deletePatientAction } from "@/modules/patients/actions/delete-patient"
import { updatePatientAction } from "@/modules/patients/actions/update-patient"
import type { CreatePatientDto } from "@/modules/patients/dto/create-patient.dto"
import type { UpdatePatientDto } from "@/modules/patients/dto/update-patient.dto"
import { unwrapActionResult } from "@/shared/errors"

export const patientsMutationKeys = {
  create: ["patients", "create"] as const,
  update: ["patients", "update"] as const,
  delete: ["patients", "delete"] as const,
}

export const patientsMutations = {
  create: () =>
    mutationOptions({
      mutationKey: patientsMutationKeys.create,
      mutationFn: async (data: CreatePatientDto) =>
        unwrapActionResult(await createPatientAction(data)),
    }),

  update: () =>
    mutationOptions({
      mutationKey: patientsMutationKeys.update,
      mutationFn: async (data: UpdatePatientDto) =>
        unwrapActionResult(await updatePatientAction(data)),
    }),

  delete: () =>
    mutationOptions({
      mutationKey: patientsMutationKeys.delete,
      mutationFn: async (id: string) =>
        unwrapActionResult(await deletePatientAction(id)),
    }),
}
