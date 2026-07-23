import { env } from "@/config/env"
import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"
import { email } from "@/core/email"
import {
  requireAnyPermission,
  requireAuth,
  requirePasswordReady,
  requirePermission,
} from "@/modules/authentication/permissions/guards"
import { authService } from "@/modules/authentication/services/auth.service"
import { clinicRepository } from "@/modules/clinics/repositories/clinic.repository"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import {
  PROFESSIONAL_ROLE_KEYS,
  PROFESSIONALS_CONSTANTS,
  type ProfessionalRoleKey,
} from "@/modules/professionals/constants/professionals"
import type { CreateProfessionalDto } from "@/modules/professionals/dto/create-professional.dto"
import type {
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
  async list(ctx: AuthRequestContext): Promise<ProfessionalListItem[]> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    return professionalRepository.listByClinic(auth.clinicId)
  },

  async listForScheduling(
    ctx: AuthRequestContext,
  ): Promise<ProfessionalSchedulingItem[]> {
    const auth = await requireAnyPermission(
      ctx,
      Permission.APPOINTMENTS_CREATE,
      Permission.APPOINTMENTS_UPDATE,
      Permission.PROFESSIONALS_MANAGE,
    )
    return professionalRepository.listActiveForScheduling(auth.clinicId)
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

  async create(
    data: CreateProfessionalDto,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalListItem> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    assertProfessionalRoleKey(data.roleKey)

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

    await authService.provisionInvitedUser({
      name: data.name,
      email: data.email,
    })

    const clinic = await clinicService.getById(auth.clinicId, ctx)

    const created = await professionalRepository.create({
      fullName: data.name,
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
        name: data.name,
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
    return listItem
  },

  async update(
    data: UpdateProfessionalDto,
    ctx: AuthRequestContext,
  ): Promise<ProfessionalListItem> {
    const auth = await requirePermission(ctx, Permission.PROFESSIONALS_MANAGE)
    const { id, name, fullName, ...rest } = data

    const existing = await professionalRepository.findById(id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Profissional não encontrado.",
      })
    }

    return professionalRepository.update({
      id,
      clinicId: auth.clinicId,
      data: {
        ...rest,
        fullName: fullName ?? name,
        specialty: rest.specialty ?? undefined,
        councilNumber: rest.councilNumber ?? undefined,
        councilState: rest.councilState ?? undefined,
        biography: rest.biography ?? undefined,
        councilType: rest.councilType ?? undefined,
      },
    })
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

    const existing = await professionalRepository.findById(id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Profissional não encontrado.",
      })
    }

    await invitationRepository.revokePendingByProfessionalId(
      id,
      auth.clinicId,
    )
    await professionalRepository.softDelete({
      id,
      clinicId: auth.clinicId,
    })
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

    await professionalRepository.update({
      id: professional.id,
      clinicId: invitation.clinicId,
      data: {
        fullName: data.fullName,
        councilType: data.councilType ?? null,
        councilNumber: data.councilNumber ?? null,
        councilState: data.councilState ?? null,
        specialty: data.specialty ?? null,
        biography: data.biography ?? null,
      },
    })

    const updated = await professionalRepository.findById(
      professional.id,
      invitation.clinicId,
    )
    if (!updated) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Profissional não encontrado.",
      })
    }

    return {
      tokenValid: true,
      fullName: updated.fullName,
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
  },

  async acceptInvite(
    data: ProfessionalInviteTokenDto,
    ctx: AuthRequestContext,
  ): Promise<{ success: true }> {
    const auth = await requirePasswordReady(ctx)
    const { invitation } = await loadInviteContext(data.token)
    assertInviteEmailMatch(auth.user.email, invitation.email)

    if (!invitation.professionalId) {
      throw new AppError(ErrorCode.INVALID_TOKEN, {
        message: "Convite inválido.",
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
