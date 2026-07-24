export const AUDIT_EVENTS = {
  RECORD: "audit.record",
} as const;

export type AuditStatus = "success" | "error";

export type AuditChanges = {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

/**
 * Payload for `audit.record` — written by domain services via `recordAudit`.
 * Never include secrets (passwords, tokens, invite hashes).
 */
export type AuditRecordPayload = {
  clinicId: string;
  actorUserId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  action: string;
  status: AuditStatus;
  entityType: string;
  entityId?: string | null;
  changes?: AuditChanges | Record<string, unknown> | null;
  errorMessage?: string | null;
  errorCode?: string | null;
};
