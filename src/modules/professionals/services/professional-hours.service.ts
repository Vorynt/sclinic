import { Permission } from "@/config/permissions"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditErrorFields, recordAudit } from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"
import type { UpsertProfessionalHoursDto } from "@/modules/professionals/dto/upsert-professional-hours.dto"
import { professionalHoursRepository } from "@/modules/professionals/repositories/professional-hours.repository"
import { professionalRepository } from "@/modules/professionals/repositories/professional.repository"
import type { ProfessionalWeeklyHours } from "@/modules/professionals/types/professional-hours"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

async function assertProfessionalInClinic(
  professionalId: string,
  clinicId: string,
): Promise<void> {
  const affiliation = await professionalRepository.findByProfessionalAndClinic(
    professionalId,
    clinicId,
  )
  if (!affiliation) {
    throw new AppError(ErrorCode.NOT_FOUND, {
      message: "Profissional não encontrado nesta clínica.",
    })
  }
}

export const professionalHoursService = {
  async getWeeklyHours(
    professionalId: string,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalWeeklyHours> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    await assertProfessionalInClinic(professionalId, auth.clinicId)

    return professionalHoursRepository.findByProfessionalId({
      clinicId: auth.clinicId,
      professionalId,
    })
  },

  async upsertWeeklyHours(
    data: UpsertProfessionalHoursDto,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalWeeklyHours> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    const actor = auditActorFromAuth(auth)

    await assertProfessionalInClinic(data.professionalId, auth.clinicId)

    const before = await professionalHoursRepository.findByProfessionalId({
      clinicId: auth.clinicId,
      professionalId: data.professionalId,
    })

    try {
      const after = await professionalHoursRepository.replaceWeeklyHours({
        clinicId: auth.clinicId,
        professionalId: data.professionalId,
        days: data.days,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_HOURS_UPSERT,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL_HOURS,
        entityId: data.professionalId,
        changes: { before, after },
      })

      return after
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_HOURS_UPSERT,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL_HOURS,
        entityId: data.professionalId,
        changes: { before, after: data.days },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  /**
   * Internal read for other modules (e.g. appointments availability).
   * Returns `null` when the professional has no configured rows, so the
   * caller can fall back to 100% of the clinic hours (ADR-011).
   */
  async getConfiguredHoursOrNull(
    clinicId: string,
    professionalId: string,
  ): Promise<ClinicWeeklyHours | null> {
    const hasHours = await professionalHoursRepository.hasAnyForProfessional({
      clinicId,
      professionalId,
    })

    if (!hasHours) {
      return null
    }

    return professionalHoursRepository.findByProfessionalId({
      clinicId,
      professionalId,
    })
  },
}
