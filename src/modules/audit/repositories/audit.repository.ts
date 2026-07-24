import { and, count, desc, eq, ilike, or } from "drizzle-orm"

import type { AuditRecordPayload } from "@/core/events"
import { db } from "@/db"
import { auditLogs } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toAuditLog } from "@/modules/audit/mappers/audit.mapper"
import type { AuditLog } from "@/modules/audit/types/audit"
import {
  toPaginatedResult,
  type PaginatedResult,
} from "@/types/pagination"

function toChangesJson(
  changes: AuditRecordPayload["changes"],
): Record<string, unknown> | null {
  if (!changes) return null
  return changes as Record<string, unknown>
}

export const auditRepository = {
  async insert(payload: AuditRecordPayload): Promise<AuditLog> {
    return withDbError(async () => {
      const [row] = await db
        .insert(auditLogs)
        .values({
          clinicId: payload.clinicId,
          actorUserId: payload.actorUserId ?? null,
          actorName: payload.actorName ?? null,
          actorEmail: payload.actorEmail ?? null,
          action: payload.action,
          status: payload.status,
          entityType: payload.entityType,
          entityId: payload.entityId ?? null,
          changes: toChangesJson(payload.changes),
          errorMessage: payload.errorMessage ?? null,
          errorCode: payload.errorCode ?? null,
        })
        .returning()

      if (!row) {
        throw new Error("Failed to insert audit log")
      }

      return toAuditLog(row)
    })
  },

  async listByClinic(params: {
    clinicId: string
    q?: string
    status?: "success" | "error"
    entityType?: string
    page: number
    pageSize: number
  }): Promise<PaginatedResult<AuditLog>> {
    return withDbError(async () => {
      const search = params.q
        ? or(
            ilike(auditLogs.action, `%${params.q}%`),
            ilike(auditLogs.actorName, `%${params.q}%`),
            ilike(auditLogs.actorEmail, `%${params.q}%`),
            ilike(auditLogs.entityType, `%${params.q}%`),
            ilike(auditLogs.entityId, `%${params.q}%`),
          )
        : undefined

      const where = and(
        eq(auditLogs.clinicId, params.clinicId),
        params.status ? eq(auditLogs.status, params.status) : undefined,
        params.entityType
          ? eq(auditLogs.entityType, params.entityType)
          : undefined,
        search,
      )

      const offset = (params.page - 1) * params.pageSize

      const [totalRow, rows] = await Promise.all([
        db.select({ total: count() }).from(auditLogs).where(where),
        db
          .select()
          .from(auditLogs)
          .where(where)
          .orderBy(desc(auditLogs.createdAt))
          .limit(params.pageSize)
          .offset(offset),
      ])

      return toPaginatedResult({
        items: rows.map(toAuditLog),
        total: totalRow[0]?.total ?? 0,
        page: params.page,
        pageSize: params.pageSize,
      })
    })
  },
}
