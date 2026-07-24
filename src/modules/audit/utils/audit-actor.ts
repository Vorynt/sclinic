import type { AuthContextWithClinic } from "@/modules/authentication/permissions/guards"
import type { AuditRecordPayload } from "@/core/events"

/** Actor + clinic snapshot for audit emits after `requirePermission`. */
export function auditActorFromAuth(
  auth: AuthContextWithClinic,
): Pick<
  AuditRecordPayload,
  "clinicId" | "actorUserId" | "actorName" | "actorEmail"
> {
  return {
    clinicId: auth.clinicId,
    actorUserId: auth.user.id,
    actorName: auth.user.name,
    actorEmail: auth.user.email,
  }
}
