"use server"

import { regenerateBackupCodesSchema } from "@/modules/authentication/schemas/auth.schema"
import { authService } from "@/modules/authentication/services/auth.service"
import type { BackupCodesResult } from "@/modules/authentication/types/auth"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function regenerateBackupCodesAction(
  data: unknown,
): Promise<ApiResponse<BackupCodesResult>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(regenerateBackupCodesSchema, data)
    return authService.regenerateBackupCodes(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
