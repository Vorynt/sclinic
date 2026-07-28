"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listActiveChargesByAppointmentsSchema } from "@/modules/billing/schemas/list-active-charges-by-appointments.schema"
import { chargeService } from "@/modules/billing/services/charge.service"
import type { Charge } from "@/modules/billing/types/charge"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listActiveChargesByAppointmentsAction(
  data: unknown,
): Promise<ApiResponse<Charge[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listActiveChargesByAppointmentsSchema, data)
    return chargeService.listActiveByAppointmentIds(
      parsed.appointmentIds,
      await getAuthRequestContext(),
    )
  })
}
