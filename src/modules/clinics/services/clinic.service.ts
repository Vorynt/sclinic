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
}
