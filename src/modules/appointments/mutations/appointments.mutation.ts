import { mutationOptions } from "@tanstack/react-query"

import { cancelAppointmentAction } from "@/modules/appointments/actions/cancel-appointment"
import { createAppointmentAction } from "@/modules/appointments/actions/create-appointment"
import { rescheduleAppointmentAction } from "@/modules/appointments/actions/reschedule-appointment"
import { updateAppointmentDetailsAction } from "@/modules/appointments/actions/update-appointment-details"
import { updateAppointmentStatusAction } from "@/modules/appointments/actions/update-appointment-status"
import type { CancelAppointmentDto } from "@/modules/appointments/dto/cancel-appointment.dto"
import type { CreateAppointmentDto } from "@/modules/appointments/dto/create-appointment.dto"
import type { RescheduleAppointmentDto } from "@/modules/appointments/dto/reschedule-appointment.dto"
import type { UpdateAppointmentDetailsDto } from "@/modules/appointments/dto/update-appointment-details.dto"
import type { UpdateAppointmentStatusDto } from "@/modules/appointments/dto/update-appointment-status.dto"
import { unwrapActionResult } from "@/shared/errors"

export const appointmentsMutationKeys = {
  create: ["appointments", "create"] as const,
  cancel: ["appointments", "cancel"] as const,
  reschedule: ["appointments", "reschedule"] as const,
  updateDetails: ["appointments", "update-details"] as const,
  updateStatus: ["appointments", "update-status"] as const,
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

  reschedule: () =>
    mutationOptions({
      mutationKey: appointmentsMutationKeys.reschedule,
      mutationFn: async (data: RescheduleAppointmentDto) =>
        unwrapActionResult(await rescheduleAppointmentAction(data)),
    }),

  updateDetails: () =>
    mutationOptions({
      mutationKey: appointmentsMutationKeys.updateDetails,
      mutationFn: async (data: UpdateAppointmentDetailsDto) =>
        unwrapActionResult(await updateAppointmentDetailsAction(data)),
    }),

  updateStatus: () =>
    mutationOptions({
      mutationKey: appointmentsMutationKeys.updateStatus,
      mutationFn: async (data: UpdateAppointmentStatusDto) =>
        unwrapActionResult(await updateAppointmentStatusAction(data)),
    }),
}
