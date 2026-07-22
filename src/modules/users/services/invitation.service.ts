import { env } from "@/config/env"
import { Permission } from "@/config/permissions"
import { email } from "@/core/email"
import {
  requirePasswordReady,
  requirePermission,
  type AuthContextWithClinic,
} from "@/modules/authentication/permissions/guards"
import { authService } from "@/modules/authentication/services/auth.service"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import { getRoleLabel, USERS_CONSTANTS } from "@/modules/users/constants/users"
import type {
  AcceptInvitationDto,
  InviteMemberDto,
} from "@/modules/users/dto/invitation.dto"
import { invitationRepository } from "@/modules/users/repositories/invitation.repository"
import { memberRepository } from "@/modules/users/repositories/member.repository"
import { roleRepository } from "@/modules/users/repositories/role.repository"
import type {
  AssignableRole,
  ClinicInvitation,
} from "@/modules/users/types/invitation"
import type { ClinicMember } from "@/modules/users/types/member"
import {
  createInviteToken,
  hashInviteToken,
} from "@/modules/users/utils/invite-token"
import { assertAssignableRoleKey } from "@/modules/users/utils/member-rules"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

async function requireTeamAccess(
  ctx: AuthRequestContext,
): Promise<AuthContextWithClinic> {
  return requirePermission(ctx, Permission.MEMBERS_INVITE)
}

export const invitationService = {
  async listAssignableRoles(
    ctx: AuthRequestContext,
  ): Promise<AssignableRole[]> {
    await requireTeamAccess(ctx)
    return roleRepository.listAssignable()
  },

  async listPending(ctx: AuthRequestContext): Promise<ClinicInvitation[]> {
    const auth = await requireTeamAccess(ctx)
    const invitations = await invitationRepository.listPendingByClinic(
      auth.clinicId,
    )

    const now = Date.now()
    const open: ClinicInvitation[] = []

    for (const invitation of invitations) {
      if (invitation.expiresAt.getTime() <= now) {
        await invitationRepository.markExpired(invitation.id)
        continue
      }
      open.push(invitation)
    }

    return open
  },

  async invite(
    data: InviteMemberDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicInvitation> {
    const auth = await requireTeamAccess(ctx)
    assertAssignableRoleKey(data.roleKey)

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

    // New accounts get the provisional password; existing ones keep theirs.
    await authService.provisionInvitedUser({
      name: data.name,
      email: data.email,
      password: data.temporaryPassword,
    })

    const clinic = await clinicService.getById(auth.clinicId, ctx)
    const rawToken = createInviteToken()
    const invitation = await invitationRepository.create({
      clinicId: auth.clinicId,
      email: data.email,
      roleId: role.id,
      invitedBy: auth.user.id,
      tokenHash: hashInviteToken(rawToken),
      expiresAt: new Date(Date.now() + USERS_CONSTANTS.INVITE_TTL_MS),
    })

    const inviteUrl = new URL("/invite", env.BETTER_AUTH_URL)
    inviteUrl.searchParams.set("token", rawToken)

    try {
      await email.messages.collaboratorInvite({
        to: data.email,
        name: data.name,
        inviterName: auth.user.name,
        clinicName: clinic.name,
        roleName: getRoleLabel(role.key, role.name),
        inviteUrl: inviteUrl.toString(),
      })
    } catch (error) {
      await invitationRepository.revoke(invitation.id, auth.clinicId)
      throw error
    }

    return invitation
  },

  async revoke(
    invitationId: string,
    ctx: AuthRequestContext,
  ): Promise<void> {
    const auth = await requireTeamAccess(ctx)
    const invitation = await invitationRepository.findById(
      invitationId,
      auth.clinicId,
    )
    if (!invitation || invitation.status !== "pending") {
      throw new AppError(ErrorCode.INVITATION_NOT_FOUND)
    }

    await invitationRepository.revoke(invitationId, auth.clinicId)
  },

  async accept(
    data: AcceptInvitationDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicMember> {
    const auth = await requirePasswordReady(ctx)
    const invitation = await invitationRepository.findByTokenHash(
      hashInviteToken(data.token),
    )

    if (!invitation) {
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
      invitation.status !== "pending" ||
      invitation.expiresAt.getTime() <= Date.now()
    ) {
      if (invitation.status === "pending") {
        await invitationRepository.markExpired(invitation.id)
      }
      throw new AppError(ErrorCode.TOKEN_EXPIRED, {
        message: "Este convite expirou. Peça um novo à clínica.",
      })
    }

    if (auth.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new AppError(ErrorCode.INVITE_EMAIL_MISMATCH, {
        message:
          "Faça login com o e-mail que recebeu o convite para aceitar.",
      })
    }

    const existing = await memberRepository.findActiveByUserAndClinic(
      auth.user.id,
      invitation.clinicId,
    )
    if (existing) {
      await invitationRepository.markAccepted(invitation.id)
      return existing
    }

    const member = await memberRepository.create({
      userId: auth.user.id,
      clinicId: invitation.clinicId,
      roleId: invitation.roleId,
    })

    await invitationRepository.markAccepted(invitation.id)

    await authService.switchClinic({ clinicId: invitation.clinicId }, ctx)

    return member
  },
}
