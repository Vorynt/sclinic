"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import {
  createClinicSchema,
  toClinicCreateFields,
  toOwnerClinicalProfileFields,
} from "@/modules/clinics/schemas/clinic.schema"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import type { Clinic } from "@/modules/clinics/types/clinic"
import { professionalService } from "@/modules/professionals/services/professional.service"
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
    const clinicFields = toClinicCreateFields(parsed)
    const clinicalProfile = toOwnerClinicalProfileFields(parsed)

    const clinic = await clinicService.createForOwner(clinicFields, {
      userId: authContext.user.id,
      sessionId: authContext.session.id,
    })

    if (clinicalProfile) {
      await professionalService.createOwnerClinicalProfileForClinic(
        clinicalProfile,
        {
          userId: authContext.user.id,
          clinicId: clinic.id,
        },
      )
    }

    return clinic
  })
}
