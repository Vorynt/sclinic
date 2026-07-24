"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { updateAccountProfileSchema } from "@/modules/users/schemas/account.schema"
import { accountService } from "@/modules/users/services/account.service"
import type { AccountProfile } from "@/modules/users/types/account"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function updateAccountProfileAction(
  data: unknown,
): Promise<ApiResponse<AccountProfile>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(updateAccountProfileSchema, data)
    return accountService.updateProfile(parsed, await getAuthRequestContext())
  })
}
