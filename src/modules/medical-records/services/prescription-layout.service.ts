import { Permission } from "@/config/permissions"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditErrorFields, recordAudit } from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import { DEFAULT_PRESCRIPTION_LAYOUT_HTML } from "@/modules/medical-records/constants/prescription-layout-default"
import type { UpsertPrescriptionLayoutDto } from "@/modules/medical-records/dto/prescription.dto"
import { prescriptionLayoutRepository } from "@/modules/medical-records/repositories/prescription.repository"
import type {
  PrescriptionLayout,
  PrescriptionLayoutSource,
} from "@/modules/medical-records/types/prescription"
import { sanitizePrescriptionHtml } from "@/modules/medical-records/utils/sanitize-prescription-html"
import type { AuthRequestContext } from "@/shared/auth"

export const prescriptionLayoutService = {
  async resolveActiveLayout(
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayoutSource> {
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    const layout = await prescriptionLayoutRepository.findActive(auth.clinicId)
    if (!layout) {
      return {
        html: DEFAULT_PRESCRIPTION_LAYOUT_HTML,
        version: null,
        source: "system_default",
        layout: null,
      }
    }
    return {
      html: layout.html,
      version: layout.version,
      source: "clinic_custom",
      layout,
    }
  },

  /** Settings: requires SETTINGS_MANAGE. */
  async getForSettings(
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayoutSource> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const layout = await prescriptionLayoutRepository.findActive(auth.clinicId)
    if (!layout) {
      return {
        html: DEFAULT_PRESCRIPTION_LAYOUT_HTML,
        version: null,
        source: "system_default",
        layout: null,
      }
    }
    return {
      html: layout.html,
      version: layout.version,
      source: "clinic_custom",
      layout,
    }
  },

  async upsert(
    data: UpsertPrescriptionLayoutDto,
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayout> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const actor = auditActorFromAuth(auth)
    const html = sanitizePrescriptionHtml(data.html.trim())

    try {
      const layout = await prescriptionLayoutRepository.createVersion({
        clinicId: auth.clinicId,
        html,
        createdBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_UPSERT,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: layout.id,
        changes: {
          after: {
            id: layout.id,
            version: layout.version,
            htmlLength: layout.html.length,
          },
        },
      })

      return layout
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_UPSERT,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  /** Deactivates custom layout so the system default is used again. */
  async resetToDefault(ctx: AuthRequestContext): Promise<void> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionLayoutRepository.findActive(
      auth.clinicId,
    )

    try {
      await prescriptionLayoutRepository.deactivateActive({
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_RESET,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: existing?.id,
        changes: {
          before: existing
            ? { id: existing.id, version: existing.version }
            : undefined,
          after: { source: "system_default" },
        },
      })
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_RESET,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: existing?.id,
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
