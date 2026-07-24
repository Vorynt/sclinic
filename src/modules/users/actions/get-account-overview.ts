"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { accountService } from "@/modules/users/services/account.service"
import type { AccountOverview } from "@/modules/users/types/account"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getAccountOverviewAction(): Promise<
  ApiResponse<AccountOverview>
> {
  return toActionResult(async () =>
    accountService.getOverview(await getAuthRequestContext()),
  )
}
