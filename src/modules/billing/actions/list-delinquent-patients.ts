"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { chargeService } from "@/modules/billing/services/charge.service"
import type { DelinquentPatient } from "@/modules/billing/types/charge"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function listDelinquentPatientsAction(): Promise<
  ApiResponse<DelinquentPatient[]>
> {
  return toActionResult(async () => {
    return chargeService.listDelinquentPatients(await getAuthRequestContext())
  })
}
