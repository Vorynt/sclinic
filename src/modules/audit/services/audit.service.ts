import type { AuditRecordPayload } from "@/core/events"
import { Permission } from "@/config/permissions"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import type { ListAuditLogsDto } from "@/modules/audit/dto/list-audit-logs.dto"
import { auditRepository } from "@/modules/audit/repositories/audit.repository"
import type { AuditLog } from "@/modules/audit/types/audit"
import type { AuthRequestContext } from "@/shared/auth"
import type { PaginatedResult } from "@/types/pagination"

export const auditService = {
  /**
   * Internal write path used by the event subscriber — no permission check.
   */
  async record(payload: AuditRecordPayload): Promise<AuditLog> {
    return auditRepository.insert(payload)
  },

  async list(
    filters: ListAuditLogsDto,
    ctx: AuthRequestContext,
  ): Promise<PaginatedResult<AuditLog>> {
    const auth = await requirePermission(ctx, Permission.AUDIT_READ)
    return auditRepository.listByClinic({
      clinicId: auth.clinicId,
      q: filters.q,
      status: filters.status,
      entityType: filters.entityType,
      page: filters.page,
      pageSize: filters.pageSize,
    })
  },
}
