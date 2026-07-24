"use server"

import { listAuditLogsSchema } from "@/modules/audit/schemas/audit.schema"
import { auditService } from "@/modules/audit/services/audit.service"
import type { AuditLog } from "@/modules/audit/types/audit"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"
import type { PaginatedResult } from "@/types/pagination"

export async function listAuditLogsAction(
  data: unknown = {},
): Promise<ApiResponse<PaginatedResult<AuditLog>>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listAuditLogsSchema, data ?? {})
    return auditService.list(parsed, await getAuthRequestContext())
  })
}
