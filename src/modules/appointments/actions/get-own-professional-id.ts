"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getOwnProfessionalIdAction(): Promise<
  ApiResponse<string | null>
> {
  return toActionResult(async () => {
    return appointmentService.getOwnProfessionalId(
      await getAuthRequestContext(),
    )
  })
}
