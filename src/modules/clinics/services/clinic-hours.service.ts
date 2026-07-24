import { Permission } from "@/config/permissions";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit";
import { auditErrorFields, recordAudit } from "@/modules/audit/emit";
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor";
import { requirePermission } from "@/modules/authentication/permissions/guards";
import { buildDefaultWeeklyHours } from "@/modules/clinics/constants/default-hours";
import type { UpsertClinicHoursDto } from "@/modules/clinics/dto/upsert-clinic-hours.dto";
import { clinicHoursRepository } from "@/modules/clinics/repositories/clinic-hours.repository";
import { clinicRepository } from "@/modules/clinics/repositories/clinic.repository";
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours";
import { buildFallbackWeeklyHours } from "@/modules/clinics/utils/clinic-hours-window";
import type { AuthRequestContext } from "@/shared/auth";

export type ClinicHoursAvailabilityContext = {
  weeklyHours: ClinicWeeklyHours;
  timeZone: string;
};

export const clinicHoursService = {
  async getWeeklyHours(ctx: AuthRequestContext): Promise<ClinicWeeklyHours> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE);
    return clinicHoursRepository.findByClinicId(auth.clinicId);
  },

  /**
   * Internal read for other modules (e.g. appointments availability).
   * Caller must already have scoped the clinic via its own auth.
   */
  async getWeeklyHoursForClinic(clinicId: string): Promise<ClinicWeeklyHours> {
    return clinicHoursRepository.findByClinicId(clinicId);
  },

  async hasConfiguredHours(clinicId: string): Promise<boolean> {
    return clinicHoursRepository.hasAnyForClinic(clinicId);
  },

  /**
   * Hours + timezone for availability checks (fallback 07:00–19:00 when unset).
   */
  async getAvailabilityContext(
    clinicId: string,
  ): Promise<ClinicHoursAvailabilityContext> {
    const [configured, clinic] = await Promise.all([
      clinicHoursRepository.hasAnyForClinic(clinicId),
      clinicRepository.findById(clinicId),
    ]);

    const weeklyHours = configured
      ? await clinicHoursRepository.findByClinicId(clinicId)
      : buildFallbackWeeklyHours();

    return {
      weeklyHours,
      timeZone: clinic?.timezone ?? "America/Sao_Paulo",
    };
  },

  async upsertWeeklyHours(
    data: UpsertClinicHoursDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicWeeklyHours> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE);
    const actor = auditActorFromAuth(auth);
    const before = await clinicHoursRepository.findByClinicId(auth.clinicId);

    try {
      const after = await clinicHoursRepository.replaceWeeklyHours({
        clinicId: auth.clinicId,
        days: data.days,
      });

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_HOURS_UPSERT,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_HOURS,
        entityId: auth.clinicId,
        changes: { before, after },
      });

      return after;
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_HOURS_UPSERT,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_HOURS,
        entityId: auth.clinicId,
        changes: { before, after: data.days },
        ...auditErrorFields(error),
      });
      throw error;
    }
  },

  /** Onboarding “Configurar depois”: persist 07:00–19:00 for all days. */
  async applyDefaultHours(ctx: AuthRequestContext): Promise<ClinicWeeklyHours> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE);
    const actor = auditActorFromAuth(auth);
    const days = buildDefaultWeeklyHours();

    try {
      const after = await clinicHoursRepository.replaceWeeklyHours({
        clinicId: auth.clinicId,
        days,
      });

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_HOURS_UPSERT,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_HOURS,
        entityId: auth.clinicId,
        changes: { after },
      });

      return after;
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_HOURS_UPSERT,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_HOURS,
        entityId: auth.clinicId,
        ...auditErrorFields(error),
      });
      throw error;
    }
  },
};
