"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { getCalendarRangeSchema } from "@/modules/appointments/schemas/appointment.schema"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import type { CalendarRange } from "@/modules/appointments/types/calendar-range"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getCalendarRangeAction(
  data: unknown,
): Promise<ApiResponse<CalendarRange>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(getCalendarRangeSchema, data)
    return appointmentService.getCalendarRange(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
