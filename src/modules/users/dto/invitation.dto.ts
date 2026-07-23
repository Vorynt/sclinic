import type {
  AcceptInvitationInput,
  InviteAccessTokenInput,
  InviteMemberInput,
  RevokeInvitationInput,
  SetPasswordFromInviteInput,
} from "@/modules/users/schemas/invitation.schema"
import type { ClinicInvitation } from "@/modules/users/types/invitation"

export type InviteMemberDto = InviteMemberInput
export type RevokeInvitationDto = RevokeInvitationInput
export type AcceptInvitationDto = AcceptInvitationInput
export type InviteAccessTokenDto = InviteAccessTokenInput
export type SetPasswordFromInviteDto = SetPasswordFromInviteInput
export type ClinicInvitationResult = ClinicInvitation
