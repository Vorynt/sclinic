import { planRepository } from "@/modules/billing/repositories/plan.repository"
import { subscriptionRepository } from "@/modules/billing/repositories/subscription.repository"
import type { Plan, Subscription } from "@/modules/billing/types/billing"
import { AppError, ErrorCode } from "@/shared/errors"

export const billingService = {
  async listActivePlans(): Promise<Plan[]> {
    return planRepository.listActive()
  },

  async getActivePlan(planId: string): Promise<Plan> {
    const plan = await planRepository.findActiveById(planId)
    if (!plan) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Plano não encontrado ou inativo.",
      })
    }
    return plan
  },

  /**
   * Attaches a catalog plan to a clinic as an incomplete subscription.
   * TODO(stripe): replace with Stripe Checkout Session + webhook that
   * activates the subscription (`active` / `trialing`) and stores gateway IDs.
   */
  async attachPlanToClinic(
    clinicId: string,
    planId: string,
  ): Promise<Subscription> {
    await this.getActivePlan(planId)
    return subscriptionRepository.createIncomplete({ clinicId, planId })
  },
}
