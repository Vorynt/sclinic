"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listProfessionalsSchema } from "@/modules/professionals/schemas/professional.schema"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { ProfessionalListItem } from "@/modules/professionals/types/professional"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"
import type { PaginatedResult } from "@/types/pagination"

export async function listProfessionalsAction(
  data: unknown = {},
): Promise<ApiResponse<PaginatedResult<ProfessionalListItem>>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listProfessionalsSchema, data ?? {})
    return professionalService.list(parsed, await getAuthRequestContext())
  })
}
