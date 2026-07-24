import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import { authService } from "@/modules/authentication/services/auth.service"
import { billingService } from "@/modules/billing/services/billing.service"
import type { CreateClinicDto } from "@/modules/clinics/dto/create-clinic.dto"
import type {
  DeleteClinicDto,
  DeleteClinicResult,
} from "@/modules/clinics/dto/delete-clinic.dto"
import type { UpdateClinicDto } from "@/modules/clinics/dto/update-clinic.dto"
import { clinicRepository } from "@/modules/clinics/repositories/clinic.repository"
import type { Clinic } from "@/modules/clinics/types/clinic"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

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

  async update(
    data: UpdateClinicDto,
    ctx: AuthRequestContext,
  ): Promise<Clinic> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)

    const existing = await clinicRepository.findById(auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Clínica não encontrada.",
      })
    }

    return clinicRepository.update({
      id: auth.clinicId,
      updatedBy: auth.user.id,
      data,
    })
  },

  /** Active clinic for settings (requires settings.manage). */
  async getActiveForSettings(ctx: AuthRequestContext): Promise<Clinic> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const clinic = await clinicRepository.findById(auth.clinicId)
    if (!clinic) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Clínica não encontrada.",
      })
    }
    return clinic
  },

  /**
   * Owner-only: soft-deletes the active clinic and all tenant data.
   */
  async delete(
    data: DeleteClinicDto,
    ctx: AuthRequestContext,
  ): Promise<DeleteClinicResult> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)

    if (auth.membership.roleKey !== "owner") {
      throw new AppError(ErrorCode.FORBIDDEN, {
        message: "Apenas o proprietário pode excluir a clínica.",
      })
    }

    const clinic = await clinicRepository.findById(auth.clinicId)
    if (!clinic) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Clínica não encontrada.",
      })
    }

    if (data.confirmationName !== clinic.name) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "O nome informado não confere com o nome da clínica.",
      })
    }

    await clinicRepository.softDeleteTenant({
      id: clinic.id,
      updatedBy: auth.user.id,
    })

    await authService.revokeAccessForClinic(clinic.id)

    const remaining = await authService.listMemberships(ctx)
    const hasOtherClinic = remaining.some(
      (membership) =>
        membership.clinicId !== clinic.id && membership.status === "active",
    )

    return {
      redirectTo: hasOtherClinic ? routes.home : routes.onboardingPlan,
    }
  },
}
