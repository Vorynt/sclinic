import type { AuditStatus } from "@/core/events"

export type AuditLog = {
  id: string
  clinicId: string
  actorUserId: string | null
  actorName: string | null
  actorEmail: string | null
  action: string
  status: AuditStatus
  entityType: string
  entityId: string | null
  changes: Record<string, unknown> | null
  errorMessage: string | null
  errorCode: string | null
  createdAt: Date
}
