import { queryOptions } from "@tanstack/react-query"

import { listAuditLogsAction } from "@/modules/audit/actions/list-audit-logs"
import type { ListAuditLogsInput } from "@/modules/audit/schemas/audit.schema"
import { unwrapActionResult } from "@/shared/errors"

export const auditQueryKeys = {
  all: ["audit"] as const,
  lists: () => [...auditQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...auditQueryKeys.lists(), filters ?? {}] as const,
}

export const auditQueries = {
  list: (filters?: ListAuditLogsInput) =>
    queryOptions({
      queryKey: auditQueryKeys.list(filters),
      queryFn: async () =>
        unwrapActionResult(await listAuditLogsAction(filters)),
    }),
}
