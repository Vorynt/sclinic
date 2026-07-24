"use client"

import { useQuery } from "@tanstack/react-query"

import { auditQueries } from "@/modules/audit/queries/audit.query"
import type { ListAuditLogsInput } from "@/modules/audit/schemas/audit.schema"

export function useAuditLogsQuery(
  filters?: ListAuditLogsInput,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...auditQueries.list(filters),
    ...options,
  })
}
