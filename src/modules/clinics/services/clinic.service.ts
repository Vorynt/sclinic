import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"
import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
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

function clinicSnapshot(clinic: Clinic) {
  return {
    id: clinic.id,
    name: clinic.name,
    tradeName: clinic.tradeName,
    timezone: clinic.timezone,
    phone: clinic.phone ?? null,
    email: clinic.email ?? null,
  }
}

export const clinicService = {
  /**
   * Owner onboarding: clinic + owner membership + user SaaS subscription (ADR-003).
   */
  /**
   * Owner onboarding: clinic + owner membership + user SaaS subscription (ADR-003).
   * Optional clinical profile is orchestrated by createClinicAction (ADR-007).
   */
  async createForOwner(
    data: CreateClinicDto,
    ctx: { userId: string; sessionId: string },
  ): Promise<Clinic> {
    const { planId, ...clinicData } = data

    try {
      await billingService.getActivePlan(planId)

      const subscription = await billingService.attachPlanToUser(
        ctx.userId,
        planId,
      )

      const clinic = await clinicRepository.create({
        ...clinicData,
        createdBy: ctx.userId,
        subscriptionStatus:
          subscription.status === "trialing" ||
          subscription.status === "active" ||
          subscription.status === "past_due" ||
          subscription.status === "incomplete"
            ? subscription.status
            : "incomplete",
      })

      await authService.createOwnerMembership({
        userId: ctx.userId,
        clinicId: clinic.id,
        sessionId: ctx.sessionId,
      })

      recordAudit({
        clinicId: clinic.id,
        actorUserId: ctx.userId,
        action: AUDIT_ACTIONS.CLINIC_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINIC,
        entityId: clinic.id,
        changes: { after: clinicSnapshot(clinic) },
      })

      return clinic
    } catch (error) {
      // Clinic may not exist yet — skip persist if we have no clinicId.
      void error
      throw error
    }
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
    const actor = auditActorFromAuth(auth)

    const existing = await clinicRepository.findById(auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Clínica não encontrada.",
      })
    }

    try {
      const clinic = await clinicRepository.update({
        id: auth.clinicId,
        updatedBy: auth.user.id,
        data,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINIC,
        entityId: clinic.id,
        changes: {
          before: clinicSnapshot(existing),
          after: clinicSnapshot(clinic),
        },
      })

      return clinic
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINIC,
        entityId: auth.clinicId,
        changes: { before: clinicSnapshot(existing), after: data },
        ...auditErrorFields(error),
      })
      throw error
    }
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
    const actor = auditActorFromAuth(auth)

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

    try {
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

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_DELETE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINIC,
        entityId: clinic.id,
        changes: { before: clinicSnapshot(clinic) },
      })

      const remaining = await authService.listMemberships(ctx)
      const hasOtherClinic = remaining.some(
        (membership) =>
          membership.clinicId !== clinic.id && membership.status === "active",
      )

      return {
        redirectTo: hasOtherClinic ? routes.home : routes.onboardingPlan,
      }
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_DELETE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINIC,
        entityId: clinic.id,
        changes: { before: clinicSnapshot(clinic) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
