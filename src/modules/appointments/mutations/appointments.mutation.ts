import { mutationOptions } from "@tanstack/react-query"

import { cancelAppointmentAction } from "@/modules/appointments/actions/cancel-appointment"
import { createAppointmentAction } from "@/modules/appointments/actions/create-appointment"
import type { CancelAppointmentDto } from "@/modules/appointments/dto/cancel-appointment.dto"
import type { CreateAppointmentDto } from "@/modules/appointments/dto/create-appointment.dto"
import { unwrapActionResult } from "@/shared/errors"

export const appointmentsMutationKeys = {
  create: ["appointments", "create"] as const,
  cancel: ["appointments", "cancel"] as const,
}

export const appointmentsMutations = {
  create: () =>
    mutationOptions({
      mutationKey: appointmentsMutationKeys.create,
      mutationFn: async (data: CreateAppointmentDto) =>
        unwrapActionResult(await createAppointmentAction(data)),
    }),

  cancel: () =>
    mutationOptions({
      mutationKey: appointmentsMutationKeys.cancel,
      mutationFn: async (data: CancelAppointmentDto) =>
        unwrapActionResult(await cancelAppointmentAction(data)),
    }),
}
