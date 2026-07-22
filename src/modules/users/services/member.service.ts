import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"
import {
  requirePermission,
  type AuthContextWithClinic,
} from "@/modules/authentication/permissions/guards"
import { Permission } from "@/config/permissions"
import type { UpdateMemberRoleDto } from "@/modules/users/dto/member.dto"
import { memberRepository } from "@/modules/users/repositories/member.repository"
import { roleRepository } from "@/modules/users/repositories/role.repository"
import type { ClinicMember } from "@/modules/users/types/member"
import {
  assertAssignableRoleKey,
  assertCanManageMember,
} from "@/modules/users/utils/member-rules"

async function requireTeamAccess(
  ctx: AuthRequestContext,
): Promise<AuthContextWithClinic> {
  return requirePermission(ctx, Permission.MEMBERS_INVITE)
}

export const memberService = {
  async list(ctx: AuthRequestContext): Promise<ClinicMember[]> {
    const auth = await requireTeamAccess(ctx)
    return memberRepository.listByClinic(auth.clinicId)
  },

  async updateRole(
    data: UpdateMemberRoleDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicMember> {
    const auth = await requireTeamAccess(ctx)
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

    return memberRepository.updateRole(
      data.membershipId,
      auth.clinicId,
      role.id,
    )
  },

  async remove(
    membershipId: string,
    ctx: AuthRequestContext,
  ): Promise<void> {
    const auth = await requireTeamAccess(ctx)

    const member = await memberRepository.findById(membershipId, auth.clinicId)
    if (!member || member.status === "removed") {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Membro não encontrado.",
      })
    }

    assertCanManageMember({
      actorUserId: auth.user.id,
      targetUserId: member.userId,
      targetRoleKey: member.roleKey,
    })

    await memberRepository.softRemove(membershipId, auth.clinicId)
  },
}
