import { Permission } from "@/config/permissions"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditErrorFields, recordAudit } from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import {
  requireAnyPermission,
  requirePermission,
} from "@/modules/authentication/permissions/guards"
import type { UpsertClinicCalendarSettingsDto } from "@/modules/clinics/dto/upsert-clinic-calendar-settings.dto"
import { clinicCalendarSettingsRepository } from "@/modules/clinics/repositories/clinic-calendar-settings.repository"
import type { ClinicCalendarSettings } from "@/modules/clinics/types/clinic-calendar-settings"
import type { AuthRequestContext } from "@/shared/auth"

const CALENDAR_SETTINGS_READ_PERMISSIONS = [
  Permission.SETTINGS_MANAGE,
  Permission.APPOINTMENTS_CREATE,
  Permission.APPOINTMENTS_UPDATE,
  Permission.APPOINTMENTS_DELETE,
] as const

export const clinicCalendarSettingsService = {
  async get(ctx: AuthRequestContext): Promise<ClinicCalendarSettings> {
    const auth = await requireAnyPermission(
      ctx,
      ...CALENDAR_SETTINGS_READ_PERMISSIONS,
    )
    return clinicCalendarSettingsRepository.findByClinicId(auth.clinicId)
  },

  /**
   * Internal read for other modules. Caller must already have scoped the clinic.
   */
  async getForClinic(clinicId: string): Promise<ClinicCalendarSettings> {
    return clinicCalendarSettingsRepository.findByClinicId(clinicId)
  },

  async upsert(
    data: UpsertClinicCalendarSettingsDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicCalendarSettings> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const actor = auditActorFromAuth(auth)
    const settings = data
    const before = await clinicCalendarSettingsRepository.findByClinicId(
      auth.clinicId,
    )

    try {
      const after = await clinicCalendarSettingsRepository.upsert({
        clinicId: auth.clinicId,
        settings,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_CALENDAR_SETTINGS_UPSERT,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_CALENDAR_SETTINGS,
        entityId: auth.clinicId,
        changes: { before, after },
      })

      return after
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_CALENDAR_SETTINGS_UPSERT,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_CALENDAR_SETTINGS,
        entityId: auth.clinicId,
        changes: { before, after: settings },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
