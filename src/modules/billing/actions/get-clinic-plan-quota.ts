"use server"

import { requireClinic } from "@/modules/authentication/permissions/guards"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { billingService } from "@/modules/billing/services/billing.service"
import type { ClinicPlanQuotaView } from "@/modules/billing/types/billing"
import { USERS_CONSTANTS } from "@/modules/users/constants/users"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getClinicPlanQuotaAction(): Promise<
  ApiResponse<ClinicPlanQuotaView>
> {
  return toActionResult(async () => {
    const auth = await requireClinic(await getAuthRequestContext())
    const quota = await billingService.getClinicPlanQuota(auth.clinicId)
    return {
      ...quota,
      isOwner: auth.membership.roleKey === USERS_CONSTANTS.OWNER_ROLE_KEY,
    }
  })
}
