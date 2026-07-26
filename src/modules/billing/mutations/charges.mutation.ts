import { mutationOptions } from "@tanstack/react-query"

import { cancelChargeAction } from "@/modules/billing/actions/cancel-charge"
import { createChargeFromAppointmentAction } from "@/modules/billing/actions/create-charge-from-appointment"
import { markChargePaidAction } from "@/modules/billing/actions/mark-charge-paid"
import type { CancelChargeDto } from "@/modules/billing/dto/cancel-charge.dto"
import type { CreateChargeFromAppointmentDto } from "@/modules/billing/dto/create-charge-from-appointment.dto"
import type { MarkChargePaidDto } from "@/modules/billing/dto/mark-charge-paid.dto"
import { unwrapActionResult } from "@/shared/errors"

export const chargesMutationKeys = {
  create: ["charges", "create"] as const,
  markPaid: ["charges", "markPaid"] as const,
  cancel: ["charges", "cancel"] as const,
}

export const chargesMutations = {
  createFromAppointment: () =>
    mutationOptions({
      mutationKey: chargesMutationKeys.create,
      mutationFn: async (data: CreateChargeFromAppointmentDto) =>
        unwrapActionResult(await createChargeFromAppointmentAction(data)),
    }),

  markPaid: () =>
    mutationOptions({
      mutationKey: chargesMutationKeys.markPaid,
      mutationFn: async (data: MarkChargePaidDto) =>
        unwrapActionResult(await markChargePaidAction(data)),
    }),

  cancel: () =>
    mutationOptions({
      mutationKey: chargesMutationKeys.cancel,
      mutationFn: async (data: CancelChargeDto) =>
        unwrapActionResult(await cancelChargeAction(data)),
    }),
}
