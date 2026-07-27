"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import { createClinicSchema } from "@/modules/clinics/schemas/clinic.schema"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import type { Clinic } from "@/modules/clinics/types/clinic"
import { AppError, ErrorCode, toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function createClinicAction(
  data: unknown,
): Promise<ApiResponse<Clinic>> {
  return toActionResult(async () => {
    const authContext = await authService.requireSession(
      await getAuthRequestContext(),
    )

    if (authContext.membership?.roleKey === "owner") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Você já possui uma clínica própria.",
      })
    }

    const parsed = parseOrThrow(createClinicSchema, data)

    return clinicService.createForOwner(parsed, {
      userId: authContext.user.id,
      sessionId: authContext.session.id,
    })
  })
}
