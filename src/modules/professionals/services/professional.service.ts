import { env } from "@/config/env"
import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"
import { email } from "@/core/email"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import {
  requireAnyPermission,
  requireAuth,
  requirePasswordReady,
  requirePermission,
} from "@/modules/authentication/permissions/guards"
import { authService } from "@/modules/authentication/services/auth.service"
import { billingService } from "@/modules/billing/services/billing.service"
import { clinicRepository } from "@/modules/clinics/repositories/clinic.repository"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import {
  PROFESSIONAL_ROLE_KEYS,
  PROFESSIONALS_CONSTANTS,
  type ProfessionalRoleKey,
} from "@/modules/professionals/constants/professionals"
import type { CreateProfessionalDto } from "@/modules/professionals/dto/create-professional.dto"
import type {
  ListProfessionalsDto,
  ProfessionalInviteTokenDto,
  SetProfessionalStatusDto,
  UpdateProfessionalInviteProfileDto,
} from "@/modules/professionals/dto/professional.dto"
import type { UpdateProfessionalDto } from "@/modules/professionals/dto/update-professional.dto"
import { professionalRepository } from "@/modules/professionals/repositories/professional.repository"
import type {
  ProfessionalInvitePreview,
  ProfessionalListItem,
  ProfessionalSchedulingItem,
} from "@/modules/professionals/types/professional"
import { getRoleLabel } from "@/modules/users/constants/users"
import { invitationRepository } from "@/modules/users/repositories/invitation.repository"
import { memberRepository } from "@/modules/users/repositories/member.repository"
import { roleRepository } from "@/modules/users/repositories/role.repository"
import {
  createInviteToken,
  hashInviteToken,
} from "@/modules/users/utils/invite-token"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"
import type { PaginatedResult } from "@/types/pagination"

function assertProfessionalRoleKey(key: string): ProfessionalRoleKey {
  if (!(PROFESSIONAL_ROLE_KEYS as readonly string[]).includes(key)) {
    throw new AppError(ErrorCode.FORBIDDEN, {
      message: "Papel inválido para profissional.",
    })
  }
  return key as ProfessionalRoleKey
}

async function loadInviteContext(token: string) {
  const invitation = await invitationRepository.findByTokenHash(
    hashInviteToken(token),
  )

  if (!invitation || !invitation.professionalId) {
    throw new AppError(ErrorCode.INVALID_TOKEN, {
      message: "Convite inválido.",
    })
  }

  if (invitation.status === "revoked") {
    throw new AppError(ErrorCode.INVITATION_REVOKED)
  }

  if (invitation.status === "accepted") {
    throw new AppError(ErrorCode.INVITATION_ALREADY_ACCEPTED)
  }

  if (
    invitation.status !== "pending" &&
    invitation.status !== "resent"
  ) {
    throw new AppError(ErrorCode.TOKEN_EXPIRED, {
      message: "Este convite expirou. Peça um novo à clínica.",
    })
  }

  if (invitation.expiresAt.getTime() <= Date.now()) {
    if (invitation.status === "pending") {
      await invitationRepository.markExpired(invitation.id)
    }
    throw new AppError(ErrorCode.TOKEN_EXPIRED, {
      message: "Este convite expirou. Peça um novo à clínica.",
    })
  }

  const professional = await professionalRepository.findById(
    invitation.professionalId,
    invitation.clinicId,
  )
  if (!professional) {
    throw new AppError(ErrorCode.NOT_FOUND, {
      message: "Profissional não encontrado.",
    })
  }

  const clinic = await clinicRepository.findById(invitation.clinicId)
  if (!clinic) {
    throw new AppError(ErrorCode.NOT_FOUND, {
      message: "Clínica não encontrada.",
    })
  }

  return { invitation, professional, clinic }
}

function assertInviteEmailMatch(
  userEmail: string,
  invitationEmail: string,
): void {
  if (userEmail.toLowerCase() !== invitationEmail.toLowerCase()) {
    throw new AppError(ErrorCode.INVITE_EMAIL_MISMATCH, {
      message:
        "Faça login com o e-mail que recebeu o convite para continuar.",
    })
  }
}

export const professionalService = {
  async list(
    filters: ListProfessionalsDto,
    ctx: AuthRequestContext,
  ): Promise<PaginatedResult<ProfessionalListItem>> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    return professionalRepository.listByClinic({
      clinicId: auth.clinicId,
      q: filters.q,
      page: filters.page,
      pageSize: filters.pageSize,
    })
  },

  async listForScheduling(
    filters: { q?: string },
    ctx: AuthRequestContext,
  ): Promise<ProfessionalSchedulingItem[]> {
    const auth = await requireAnyPermission(
      ctx,
      Permission.APPOINTMENTS_CREATE,
      Permission.APPOINTMENTS_UPDATE,
      Permission.PROFESSIONALS_MANAGE,
    )

    // Professionals may only schedule for themselves — narrow the selectable list.
    if (
      (PROFESSIONAL_ROLE_KEYS as readonly string[]).includes(
        auth.membership.roleKey,
      )
    ) {
      const mine = await professionalRepository.findActiveForSchedulingByUserId(
        auth.user.id,
        auth.clinicId,
      )
      return mine ? [mine] : []
    }

    return professionalRepository.listActiveForScheduling({
      clinicId: auth.clinicId,
      q: filters.q,
    })
  },

  async getById(
    id: string,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalListItem> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    const professional = await professionalRepository.findById(
      id,
      auth.clinicId,
    )
    if (!professional) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Profissional não encontrado.",
      })
    }
    return professional
  },

  /**
   * Read professional profile for clinical documents (e.g. prescription snapshots).
   * Does not require professionals.manage — only records access in the tenant.
   */
  async getByIdForRecords(
    id: string,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalListItem | null> {
    const auth = await requireAnyPermission(
      ctx,
      Permission.RECORDS_READ,
      Permission.RECORDS_WRITE,
      Permission.PROFESSIONALS_MANAGE,
    )
    return professionalRepository.findById(id, auth.clinicId)
  },

  async create(
    data: CreateProfessionalDto,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalListItem> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    const actor = auditActorFromAuth(auth)
    assertProfessionalRoleKey(data.roleKey)
    await billingService.assertPlanCapacity(auth.clinicId, "professionals")

    const existingMember = await memberRepository.findActiveByEmailAndClinic(
      data.email,
      auth.clinicId,
    )
    if (existingMember) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Este e-mail já faz parte da clínica.",
      })
    }

    const pending = await invitationRepository.findPendingByEmailAndClinic(
      data.email,
      auth.clinicId,
    )
    if (pending && pending.expiresAt.getTime() > Date.now()) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Já existe um convite pendente para este e-mail.",
      })
    }
    if (pending) {
      await invitationRepository.markExpired(pending.id)
    }

    const role = await roleRepository.findSystemByKey(data.roleKey)
    if (!role) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Papel não encontrado.",
      })
    }

    // Provisional auth display name until the invitee completes their profile.
    const provisionalName = data.email.split("@")[0] || data.email

    try {
      await authService.provisionInvitedUser({
        name: provisionalName,
        email: data.email,
      })

      const clinic = await clinicService.getById(auth.clinicId, ctx)

      const created = await professionalRepository.create({
        fullName: null,
        treatmentPronoun: null,
        status: "inactive",
      })

      await professionalRepository.createAffiliation({
        professionalId: created.id,
        clinicId: auth.clinicId,
        affiliationType: data.affiliationType,
        status: "inactive",
      })

      const rawToken = createInviteToken()
      const invitation = await invitationRepository.create({
        clinicId: auth.clinicId,
        email: data.email,
        roleId: role.id,
        invitedBy: auth.user.id,
        tokenHash: hashInviteToken(rawToken),
        expiresAt: new Date(
          Date.now() + PROFESSIONALS_CONSTANTS.INVITE_TTL_MS,
        ),
        professionalId: created.id,
      })

      const reviewUrl = new URL(
        routes.professionalInvite,
        env.BETTER_AUTH_URL,
      )
      reviewUrl.searchParams.set("token", rawToken)

      try {
        await email.messages.professionalInvite({
          to: data.email,
          name: null,
          inviterName: auth.user.name,
          clinicName: clinic.name,
          roleName: getRoleLabel(role.key, role.name),
          reviewUrl: reviewUrl.toString(),
        })
      } catch (error) {
        await invitationRepository.revoke(invitation.id, auth.clinicId)
        await professionalRepository.softDelete({
          id: created.id,
          clinicId: auth.clinicId,
        })
        throw error
      }

      const listItem = await professionalRepository.findById(
        created.id,
        auth.clinicId,
      )
      if (!listItem) {
        throw new AppError(ErrorCode.INTERNAL_ERROR, {
          message: "Falha ao carregar profissional após criação.",
        })
      }

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL,
        entityId: listItem.id,
        changes: {
          after: {
            id: listItem.id,
            email: data.email,
            roleKey: data.roleKey,
            affiliationType: data.affiliationType,
          },
        },
      })

      return listItem
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL,
        changes: {
          after: {
            email: data.email,
            roleKey: data.roleKey,
            affiliationType: data.affiliationType,
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async update(
    data: UpdateProfessionalDto,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalListItem> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    const actor = auditActorFromAuth(auth)
    const { id, name, fullName, ...rest } = data

    const existing = await professionalRepository.findById(id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Profissional não encontrado.",
      })
    }

    try {
      const updated = await professionalRepository.update({
        id,
        clinicId: auth.clinicId,
        data: {
          ...rest,
          fullName: fullName ?? name,
          treatmentPronoun: rest.treatmentPronoun ?? undefined,
          specialty: rest.specialty ?? undefined,
          councilNumber: rest.councilNumber ?? undefined,
          councilState: rest.councilState ?? undefined,
          biography: rest.biography ?? undefined,
          councilType: rest.councilType ?? undefined,
        },
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL,
        entityId: updated.id,
        changes: {
          before: {
            id: existing.id,
            fullName: existing.fullName,
            specialty: existing.specialty,
            status: existing.status,
          },
          after: {
            id: updated.id,
            fullName: updated.fullName,
            specialty: updated.specialty,
            status: updated.status,
          },
        },
      })

      return updated
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL,
        entityId: id,
        changes: {
          before: {
            id: existing.id,
            fullName: existing.fullName,
          },
          after: { fullName: fullName ?? name, ...rest },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async setStatus(
    data: SetProfessionalStatusDto,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalListItem> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)

    const existing = await professionalRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Profissional não encontrado.",
      })
    }

    return professionalRepository.setStatus({
      id: data.id,
      clinicId: auth.clinicId,
      status: data.status,
    })
  },

  async delete(id: string, ctx: AuthRequestContext): Promise<void> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    const actor = auditActorFromAuth(auth)

    const existing = await professionalRepository.findById(id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Profissional não encontrado.",
      })
    }

    try {
      await invitationRepository.revokePendingByProfessionalId(
        id,
        auth.clinicId,
      )
      await professionalRepository.softDelete({
        id,
        clinicId: auth.clinicId,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_DELETE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL,
        entityId: id,
        changes: {
          before: {
            id: existing.id,
            fullName: existing.fullName,
            status: existing.status,
          },
        },
      })
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_DELETE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL,
        entityId: id,
        changes: {
          before: {
            id: existing.id,
            fullName: existing.fullName,
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async getInvitePreview(
    data: ProfessionalInviteTokenDto,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalInvitePreview> {
    const auth = await requireAuth(ctx)
    const { invitation, professional, clinic } = await loadInviteContext(
      data.token,
    )
    assertInviteEmailMatch(auth.user.email, invitation.email)

    return {
      tokenValid: true,
      fullName: professional.fullName,
      treatmentPronoun: professional.treatmentPronoun,
      email: invitation.email,
      clinicName: clinic.name,
      roleName: getRoleLabel(invitation.roleKey, invitation.roleName),
      affiliationType: professional.affiliationType,
      councilType: professional.councilType,
      councilNumber: professional.councilNumber,
      councilState: professional.councilState,
      specialty: professional.specialty,
      biography: professional.biography,
      professionalId: professional.id,
      expiresAt: invitation.expiresAt,
    }
  },

  async updateInviteProfile(
    data: UpdateProfessionalInviteProfileDto,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalInvitePreview> {
    const auth = await requireAuth(ctx)
    const { invitation, professional, clinic } = await loadInviteContext(
      data.token,
    )
    assertInviteEmailMatch(auth.user.email, invitation.email)

    const actor = {
      clinicId: invitation.clinicId,
      actorUserId: auth.user.id,
      actorName: auth.user.name,
      actorEmail: auth.user.email,
    }

    try {
      await professionalRepository.update({
        id: professional.id,
        clinicId: invitation.clinicId,
        data: {
          fullName: data.fullName,
          treatmentPronoun: data.treatmentPronoun,
          councilType: data.councilType ?? null,
          councilNumber: data.councilNumber ?? null,
          councilState: data.councilState ?? null,
          specialty: data.specialty ?? null,
          biography: data.biography ?? null,
        },
      })

      await authService.updateDisplayName(auth.user.id, data.fullName)

      const updated = await professionalRepository.findById(
        professional.id,
        invitation.clinicId,
      )
      if (!updated) {
        throw new AppError(ErrorCode.NOT_FOUND, {
          message: "Profissional não encontrado.",
        })
      }

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_INVITE_PROFILE_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL,
        entityId: updated.id,
        changes: {
          before: {
            fullName: professional.fullName,
            treatmentPronoun: professional.treatmentPronoun,
          },
          after: {
            fullName: updated.fullName,
            treatmentPronoun: updated.treatmentPronoun,
            specialty: updated.specialty,
          },
        },
      })

      return {
        tokenValid: true,
        fullName: updated.fullName,
        treatmentPronoun: updated.treatmentPronoun,
        email: invitation.email,
        clinicName: clinic.name,
        roleName: getRoleLabel(invitation.roleKey, invitation.roleName),
        affiliationType: updated.affiliationType,
        councilType: updated.councilType,
        councilNumber: updated.councilNumber,
        councilState: updated.councilState,
        specialty: updated.specialty,
        biography: updated.biography,
        professionalId: updated.id,
        expiresAt: invitation.expiresAt,
      }
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PROFESSIONAL_INVITE_PROFILE_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PROFESSIONAL,
        entityId: professional.id,
        changes: {
          after: {
            fullName: data.fullName,
            treatmentPronoun: data.treatmentPronoun,
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async acceptInvite(
    data: ProfessionalInviteTokenDto,
    ctx: AuthRequestContext,
  ): Promise<{ success: true }> {
    const auth = await requirePasswordReady(ctx)
    const { invitation, professional } = await loadInviteContext(data.token)
    assertInviteEmailMatch(auth.user.email, invitation.email)

    if (!invitation.professionalId) {
      throw new AppError(ErrorCode.INVALID_TOKEN, {
        message: "Convite inválido.",
      })
    }

    if (!professional.fullName?.trim() || !professional.treatmentPronoun) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message:
          "Complete seu nome e pronome de tratamento antes de aceitar o convite.",
      })
    }

    const existing = await memberRepository.findActiveByUserAndClinic(
      auth.user.id,
      invitation.clinicId,
    )
    if (!existing) {
      await memberRepository.create({
        userId: auth.user.id,
        clinicId: invitation.clinicId,
        roleId: invitation.roleId,
      })
    }

    await professionalRepository.activateAfterAccept({
      professionalId: invitation.professionalId,
      clinicId: invitation.clinicId,
      userId: auth.user.id,
    })

    await invitationRepository.markAccepted(invitation.id)
    await authService.markEmailVerifiedFromInvite(auth.user.id)
    await authService.switchClinic({ clinicId: invitation.clinicId }, ctx)

    return { success: true }
  },
}
