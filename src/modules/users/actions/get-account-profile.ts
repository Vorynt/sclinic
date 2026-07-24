"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { accountService } from "@/modules/users/services/account.service"
import type { AccountProfile } from "@/modules/users/types/account"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getAccountProfileAction(): Promise<
  ApiResponse<AccountProfile>
> {
  return toActionResult(async () =>
    accountService.getProfile(await getAuthRequestContext()),
  )
}
