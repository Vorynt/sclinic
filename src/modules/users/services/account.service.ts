import { requireAuth } from "@/modules/authentication/permissions/guards"
import { authService } from "@/modules/authentication/services/auth.service"
import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import type {
  LeaveOwnClinicDto,
  LeaveOwnClinicResult,
} from "@/modules/users/dto/leave-own-clinic.dto"
import type { UpdateAccountProfileDto } from "@/modules/users/dto/update-account-profile.dto"
import { accountRepository } from "@/modules/users/repositories/account.repository"
import { memberRepository } from "@/modules/users/repositories/member.repository"
import type {
  AccountOverview,
  AccountProfile,
} from "@/modules/users/types/account"
import { assertCanLeaveOwnClinic } from "@/modules/users/utils/member-rules"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

export const accountService = {
  async getOverview(ctx: AuthRequestContext): Promise<AccountOverview> {
    const auth = await requireAuth(ctx)
    const overview = await accountRepository.findOverview(
      auth.user.id,
      auth.session.activeClinicId,
    )

    if (!overview) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Conta não encontrada.",
      })
    }

    return overview
  },

  async getProfile(ctx: AuthRequestContext): Promise<AccountProfile> {
    const auth = await requireAuth(ctx)
    const profile = await accountRepository.findProfile(auth.user.id)

    if (!profile) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Conta não encontrada.",
      })
    }

    return profile
  },

  async updateProfile(
    data: UpdateAccountProfileDto,
    ctx: AuthRequestContext,
  ): Promise<AccountProfile> {
    const auth = await requireAuth(ctx)
    const updated = await accountRepository.updateProfile({
      userId: auth.user.id,
      name: data.name,
      phone: data.phone,
    })

    if (!updated) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Conta não encontrada.",
      })
    }

    return updated
  },

  async leaveClinic(
    data: LeaveOwnClinicDto,
    ctx: AuthRequestContext,
  ): Promise<LeaveOwnClinicResult> {
    const auth = await requireAuth(ctx)
    const member = await memberRepository.findByUserAndClinic(
      auth.user.id,
      data.clinicId,
    )

    if (!member) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Você não faz parte desta clínica.",
      })
    }

    assertCanLeaveOwnClinic({ roleKey: member.roleKey })

    const leftCurrentClinic = auth.session.activeClinicId === data.clinicId
    const before = {
      id: member.id,
      userId: member.userId,
      name: member.userName,
      email: member.userEmail,
      roleKey: member.roleKey,
      status: member.status,
    }

    try {
      await memberRepository.softRemove(member.id, data.clinicId)

      if (leftCurrentClinic) {
        await authService.clearActiveClinicForUser(auth.user.id, data.clinicId)
      }

      recordAudit({
        clinicId: data.clinicId,
        actorUserId: auth.user.id,
        actorName: auth.user.name,
        actorEmail: auth.user.email,
        action: AUDIT_ACTIONS.MEMBER_LEAVE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.MEMBER,
        entityId: member.id,
        changes: { before },
      })
    } catch (error) {
      recordAudit({
        clinicId: data.clinicId,
        actorUserId: auth.user.id,
        actorName: auth.user.name,
        actorEmail: auth.user.email,
        action: AUDIT_ACTIONS.MEMBER_LEAVE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.MEMBER,
        entityId: member.id,
        changes: { before },
        ...auditErrorFields(error),
      })
      throw error
    }

    return { leftCurrentClinic }
  },
}
