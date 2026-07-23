import { mutationOptions } from "@tanstack/react-query"

import type { AuthContext } from "@/modules/authentication/types/auth"
import { acceptInvitationAction } from "@/modules/users/actions/accept-invitation"
import { inviteMemberAction } from "@/modules/users/actions/invite-member"
import { removeMemberAction } from "@/modules/users/actions/remove-member"
import { revokeInvitationAction } from "@/modules/users/actions/revoke-invitation"
import { setPasswordFromInviteAction } from "@/modules/users/actions/set-password-from-invite"
import { updateMemberRoleAction } from "@/modules/users/actions/update-member-role"
import type {
  AcceptInvitationDto,
  InviteMemberDto,
  RevokeInvitationDto,
  SetPasswordFromInviteDto,
} from "@/modules/users/dto/invitation.dto"
import type { UpdateMemberRoleDto } from "@/modules/users/dto/member.dto"
import { unwrapActionResult } from "@/shared/errors"

export const usersMutationKeys = {
  invite: ["users", "invite"] as const,
  revokeInvitation: ["users", "revoke-invitation"] as const,
  acceptInvitation: ["users", "accept-invitation"] as const,
  setPasswordFromInvite: ["users", "set-password-from-invite"] as const,
  updateRole: ["users", "update-role"] as const,
  removeMember: ["users", "remove-member"] as const,
}

export const usersMutations = {
  invite: () =>
    mutationOptions({
      mutationKey: usersMutationKeys.invite,
      mutationFn: async (data: InviteMemberDto) =>
        unwrapActionResult(await inviteMemberAction(data)),
    }),

  revokeInvitation: () =>
    mutationOptions({
      mutationKey: usersMutationKeys.revokeInvitation,
      mutationFn: async (data: RevokeInvitationDto) =>
        unwrapActionResult(await revokeInvitationAction(data)),
    }),

  acceptInvitation: () =>
    mutationOptions({
      mutationKey: usersMutationKeys.acceptInvitation,
      mutationFn: async (data: AcceptInvitationDto) =>
        unwrapActionResult(await acceptInvitationAction(data)),
    }),

  setPasswordFromInvite: () =>
    mutationOptions({
      mutationKey: usersMutationKeys.setPasswordFromInvite,
      mutationFn: async (data: SetPasswordFromInviteDto): Promise<AuthContext> =>
        unwrapActionResult(await setPasswordFromInviteAction(data)),
    }),

  updateRole: () =>
    mutationOptions({
      mutationKey: usersMutationKeys.updateRole,
      mutationFn: async (data: UpdateMemberRoleDto) =>
        unwrapActionResult(await updateMemberRoleAction(data)),
    }),

  removeMember: () =>
    mutationOptions({
      mutationKey: usersMutationKeys.removeMember,
      mutationFn: async (data: { membershipId: string }) =>
        unwrapActionResult(await removeMemberAction(data)),
    }),
}
