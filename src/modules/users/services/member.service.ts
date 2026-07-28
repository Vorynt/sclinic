import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"
import {
  requirePermission,
  type AuthContextWithClinic,
} from "@/modules/authentication/permissions/guards"
import { Permission } from "@/config/permissions"
import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import type {
  ListMembersDto,
  UpdateMemberRoleDto,
} from "@/modules/users/dto/member.dto"
import { memberRepository } from "@/modules/users/repositories/member.repository"
import { roleRepository } from "@/modules/users/repositories/role.repository"
import type { ClinicMember } from "@/modules/users/types/member"
import {
  assertAssignableRoleKey,
  assertCanManageMember,
} from "@/modules/users/utils/member-rules"
import type { PaginatedResult } from "@/types/pagination"

async function requireTeamAccess(
  ctx: AuthRequestContext,
): Promise<AuthContextWithClinic> {
  return requirePermission(ctx, Permission.MEMBERS_INVITE)
}

function memberSnapshot(member: ClinicMember) {
  return {
    id: member.id,
    userId: member.userId,
    name: member.userName,
    email: member.userEmail,
    roleKey: member.roleKey,
    status: member.status,
  }
}

export const memberService = {
  async list(
    filters: ListMembersDto,
    ctx: AuthRequestContext,
  ): Promise<PaginatedResult<ClinicMember>> {
    const auth = await requireTeamAccess(ctx)
    return memberRepository.listByClinic({
      clinicId: auth.clinicId,
      q: filters.q,
      page: filters.page,
      pageSize: filters.pageSize,
    })
  },

  async updateRole(
    data: UpdateMemberRoleDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicMember> {
    const auth = await requireTeamAccess(ctx)
    const actor = auditActorFromAuth(auth)
    assertAssignableRoleKey(data.roleKey)

    const member = await memberRepository.findById(
      data.membershipId,
      auth.clinicId,
    )
    if (!member || member.status === "removed") {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Membro não encontrado.",
      })
    }

    try {
      assertCanManageMember({
        actorUserId: auth.user.id,
        targetUserId: member.userId,
        targetRoleKey: member.roleKey,
      })

      const role = await roleRepository.findSystemByKey(data.roleKey)
      if (!role) {
        throw new AppError(ErrorCode.NOT_FOUND, {
          message: "Papel não encontrado.",
        })
      }

      const updated = await memberRepository.updateRole(
        data.membershipId,
        auth.clinicId,
        role.id,
      )

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.MEMBER_ROLE_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.MEMBER,
        entityId: updated.id,
        changes: {
          before: memberSnapshot(member),
          after: memberSnapshot(updated),
        },
      })

      return updated
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.MEMBER_ROLE_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.MEMBER,
        entityId: data.membershipId,
        changes: {
          before: memberSnapshot(member),
          after: { roleKey: data.roleKey },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async remove(
    membershipId: string,
    ctx: AuthRequestContext,
  ): Promise<void> {
    const auth = await requireTeamAccess(ctx)
    const actor = auditActorFromAuth(auth)

    const member = await memberRepository.findById(membershipId, auth.clinicId)
    if (!member || member.status === "removed") {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Membro não encontrado.",
      })
    }

    try {
      assertCanManageMember({
        actorUserId: auth.user.id,
        targetUserId: member.userId,
        targetRoleKey: member.roleKey,
      })

      // Soft-remove: keep the row for FK/history; hide from team list and free seat.
      await memberRepository.softRemove(membershipId, auth.clinicId)

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.MEMBER_REMOVE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.MEMBER,
        entityId: membershipId,
        changes: { before: memberSnapshot(member) },
      })
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.MEMBER_REMOVE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.MEMBER,
        entityId: membershipId,
        changes: { before: memberSnapshot(member) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async setStatus(
    membershipId: string,
    status: "active" | "suspended",
    ctx: AuthRequestContext,
  ): Promise<ClinicMember> {
    const auth = await requireTeamAccess(ctx)
    const actor = auditActorFromAuth(auth)

    const member = await memberRepository.findById(membershipId, auth.clinicId)
    if (!member || member.status === "removed") {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Membro não encontrado.",
      })
    }

    try {
      assertCanManageMember({
        actorUserId: auth.user.id,
        targetUserId: member.userId,
        targetRoleKey: member.roleKey,
      })

      const updated = await memberRepository.setStatus(
        membershipId,
        auth.clinicId,
        status,
      )

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.MEMBER_STATUS_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.MEMBER,
        entityId: updated.id,
        changes: {
          before: memberSnapshot(member),
          after: memberSnapshot(updated),
        },
      })

      return updated
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.MEMBER_STATUS_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.MEMBER,
        entityId: membershipId,
        changes: {
          before: memberSnapshot(member),
          after: { status },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
