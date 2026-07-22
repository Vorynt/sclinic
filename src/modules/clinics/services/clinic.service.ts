import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"
import { authService } from "@/modules/authentication/services/auth.service"
import { billingService } from "@/modules/billing/services/billing.service"
import type { CreateClinicDto } from "@/modules/clinics/dto/create-clinic.dto"
import { clinicRepository } from "@/modules/clinics/repositories/clinic.repository"
import type { Clinic } from "@/modules/clinics/types/clinic"

export const clinicService = {
  /**
   * Owner onboarding: clinic + owner membership + incomplete subscription.
   */
  async createForOwner(
    data: CreateClinicDto,
    ctx: { userId: string; sessionId: string },
  ): Promise<Clinic> {
    const { planId, ...clinicData } = data

    await billingService.getActivePlan(planId)

    const clinic = await clinicRepository.create({
      ...clinicData,
      createdBy: ctx.userId,
      subscriptionStatus: "incomplete",
    })

    await authService.createOwnerMembership({
      userId: ctx.userId,
      clinicId: clinic.id,
      sessionId: ctx.sessionId,
    })

    await billingService.attachPlanToClinic(clinic.id, planId)

    return clinic
  },

  /**
   * Returns a clinic the authenticated user belongs to.
   */
  async getById(clinicId: string, ctx: AuthRequestContext): Promise<Clinic> {
    const memberships = await authService.listMemberships(ctx)
    if (!memberships.some((m) => m.clinicId === clinicId)) {
      throw new AppError(ErrorCode.MEMBERSHIP_NOT_FOUND)
    }

    const clinic = await clinicRepository.findById(clinicId)
    if (!clinic) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Clínica não encontrada.",
      })
    }

    return clinic
  },

  /**
   * Returns clinics the user belongs to, filtered by the requested ids.
   */
  async listByIds(
    clinicIds: string[],
    ctx: AuthRequestContext,
  ): Promise<Clinic[]> {
    const memberships = await authService.listMemberships(ctx)
    const allowed = new Set(memberships.map((m) => m.clinicId))
    const ids = [...new Set(clinicIds)].filter((id) => allowed.has(id))

    return clinicRepository.findByIds(ids)
  },
}
