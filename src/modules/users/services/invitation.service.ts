import { env } from "@/config/env"
import { Permission } from "@/config/permissions"
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
  requirePasswordReady,
  requirePermission,
  type AuthContextWithClinic,
} from "@/modules/authentication/permissions/guards"
import { authService } from "@/modules/authentication/services/auth.service"
import type { AuthContext } from "@/modules/authentication/types/auth"
import { billingService } from "@/modules/billing/services/billing.service"
import { clinicRepository } from "@/modules/clinics/repositories/clinic.repository"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import { getRoleLabel, USERS_CONSTANTS } from "@/modules/users/constants/users"
import type {
  AcceptInvitationDto,
  InviteMemberDto,
  SetPasswordFromInviteDto,
} from "@/modules/users/dto/invitation.dto"
import { invitationRepository } from "@/modules/users/repositories/invitation.repository"
import { memberRepository } from "@/modules/users/repositories/member.repository"
import { roleRepository } from "@/modules/users/repositories/role.repository"
import type {
  AssignableRole,
  ClinicInvitation,
  InviteAccess,
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

async function loadOpenInvitation(token: string): Promise<ClinicInvitation> {
  const invitation = await invitationRepository.findByTokenHash(
    hashInviteToken(token),
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
    (invitation.status !== "pending" && invitation.status !== "resent") ||
    invitation.expiresAt.getTime() <= Date.now()
  ) {
    if (invitation.status === "pending" || invitation.status === "resent") {
      await invitationRepository.markExpired(invitation.id)
    }
    throw new AppError(ErrorCode.TOKEN_EXPIRED, {
      message: "Este convite expirou. Peça um novo à clínica.",
    })
  }

  return invitation
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

  async getInviteAccess(token: string): Promise<InviteAccess> {
    const invitation = await loadOpenInvitation(token)
    const clinic = await clinicRepository.findById(invitation.clinicId)
    if (!clinic) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Clínica não encontrada.",
      })
    }

    const needsPasswordSetup = await authService.requiresPasswordSetup(
      invitation.email,
    )

    return {
      email: invitation.email,
      clinicName: clinic.name,
      roleName: getRoleLabel(invitation.roleKey, invitation.roleName),
      needsPasswordSetup,
      isProfessionalInvite: Boolean(invitation.professionalId),
      expiresAt: invitation.expiresAt,
    }
  },

  async setPasswordFromInvite(
    data: SetPasswordFromInviteDto,
    ctx: AuthRequestContext,
  ): Promise<AuthContext> {
    const invitation = await loadOpenInvitation(data.token)

    return authService.setPasswordAndSignIn(
      {
        email: invitation.email,
        newPassword: data.newPassword,
      },
      ctx,
    )
  },

  async invite(
    data: InviteMemberDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicInvitation> {
    const auth = await requireTeamAccess(ctx)
    const actor = auditActorFromAuth(auth)
    assertAssignableRoleKey(data.roleKey)
    await billingService.assertPlanCapacity(auth.clinicId, "users")

    try {
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

      // New accounts get an opaque provisional password; invitees set theirs via token.
      await authService.provisionInvitedUser({
        name: data.name,
        email: data.email,
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

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.INVITATION_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.INVITATION,
        entityId: invitation.id,
        changes: {
          after: {
            email: invitation.email,
            roleKey: invitation.roleKey,
            status: invitation.status,
          },
        },
      })

      return invitation
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.INVITATION_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.INVITATION,
        changes: {
          after: { email: data.email, name: data.name, roleKey: data.roleKey },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async revoke(
    invitationId: string,
    ctx: AuthRequestContext,
  ): Promise<void> {
    const auth = await requireTeamAccess(ctx)
    const actor = auditActorFromAuth(auth)
    const invitation = await invitationRepository.findById(
      invitationId,
      auth.clinicId,
    )

    try {
      if (!invitation || invitation.status !== "pending") {
        throw new AppError(ErrorCode.INVITATION_NOT_FOUND)
      }

      await invitationRepository.revoke(invitationId, auth.clinicId)

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.INVITATION_REVOKE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.INVITATION,
        entityId: invitationId,
        changes: {
          before: {
            email: invitation.email,
            roleKey: invitation.roleKey,
            status: invitation.status,
          },
        },
      })
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.INVITATION_REVOKE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.INVITATION,
        entityId: invitationId,
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async accept(
    data: AcceptInvitationDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicMember> {
    const auth = await requirePasswordReady(ctx)
    const invitation = await loadOpenInvitation(data.token)

    try {
      if (auth.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new AppError(ErrorCode.INVITE_EMAIL_MISMATCH, {
          message:
            "Faça login com o e-mail que recebeu o convite para aceitar.",
        })
      }

      const existing = await memberRepository.findByUserAndClinic(
        auth.user.id,
        invitation.clinicId,
      )
      if (existing) {
        const member =
          existing.status === "suspended"
            ? await memberRepository.setStatus(
                existing.id,
                invitation.clinicId,
                "active",
              )
            : existing

        await invitationRepository.markAccepted(invitation.id)
        await authService.markEmailVerifiedFromInvite(auth.user.id)
        await authService.switchClinic({ clinicId: invitation.clinicId }, ctx)

        recordAudit({
          clinicId: invitation.clinicId,
          actorUserId: auth.user.id,
          actorName: auth.user.name,
          actorEmail: auth.user.email,
          action: AUDIT_ACTIONS.INVITATION_ACCEPT,
          status: "success",
          entityType: AUDIT_ENTITY_TYPES.INVITATION,
          entityId: invitation.id,
          changes: {
            after: {
              membershipId: member.id,
              roleKey: member.roleKey,
              status: member.status,
            },
          },
        })

        return member
      }

      const member = await memberRepository.create({
        userId: auth.user.id,
        clinicId: invitation.clinicId,
        roleId: invitation.roleId,
      })

      await invitationRepository.markAccepted(invitation.id)
      await authService.markEmailVerifiedFromInvite(auth.user.id)

      await authService.switchClinic({ clinicId: invitation.clinicId }, ctx)

      recordAudit({
        clinicId: invitation.clinicId,
        actorUserId: auth.user.id,
        actorName: auth.user.name,
        actorEmail: auth.user.email,
        action: AUDIT_ACTIONS.INVITATION_ACCEPT,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.INVITATION,
        entityId: invitation.id,
        changes: {
          after: {
            membershipId: member.id,
            roleKey: member.roleKey,
            status: member.status,
          },
        },
      })

      return member
    } catch (error) {
      recordAudit({
        clinicId: invitation.clinicId,
        actorUserId: auth.user.id,
        actorName: auth.user.name,
        actorEmail: auth.user.email,
        action: AUDIT_ACTIONS.INVITATION_ACCEPT,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.INVITATION,
        entityId: invitation.id,
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
