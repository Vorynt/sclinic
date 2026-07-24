import { Permission } from "@/config/permissions"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import { buildDefaultWeeklyHours } from "@/modules/clinics/constants/default-hours"
import type { UpsertClinicHoursDto } from "@/modules/clinics/dto/upsert-clinic-hours.dto"
import { clinicHoursRepository } from "@/modules/clinics/repositories/clinic-hours.repository"
import { clinicRepository } from "@/modules/clinics/repositories/clinic.repository"
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"
import { buildFallbackWeeklyHours } from "@/modules/clinics/utils/clinic-hours-window"
import type { AuthRequestContext } from "@/shared/auth"

export type ClinicHoursAvailabilityContext = {
  weeklyHours: ClinicWeeklyHours
  timeZone: string
}

export const clinicHoursService = {
  async getWeeklyHours(ctx: AuthRequestContext): Promise<ClinicWeeklyHours> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    return clinicHoursRepository.findByClinicId(auth.clinicId)
  },

  /**
   * Internal read for other modules (e.g. appointments availability).
   * Caller must already have scoped the clinic via its own auth.
   */
  async getWeeklyHoursForClinic(clinicId: string): Promise<ClinicWeeklyHours> {
    return clinicHoursRepository.findByClinicId(clinicId)
  },

  async hasConfiguredHours(clinicId: string): Promise<boolean> {
    return clinicHoursRepository.hasAnyForClinic(clinicId)
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
    ])

    const weeklyHours = configured
      ? await clinicHoursRepository.findByClinicId(clinicId)
      : buildFallbackWeeklyHours()

    return {
      weeklyHours,
      timeZone: clinic?.timezone ?? "America/Sao_Paulo",
    }
  },

  async upsertWeeklyHours(
    data: UpsertClinicHoursDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicWeeklyHours> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)

    return clinicHoursRepository.replaceWeeklyHours({
      clinicId: auth.clinicId,
      days: data.days,
    })
  },

  /** Onboarding “Configurar depois”: persist 07:00–19:00 for all days. */
  async applyDefaultHours(
    ctx: AuthRequestContext,
  ): Promise<ClinicWeeklyHours> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)

    return clinicHoursRepository.replaceWeeklyHours({
      clinicId: auth.clinicId,
      days: buildDefaultWeeklyHours(),
    })
  },
}
