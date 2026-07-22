import type {
  AcceptInvitationInput,
  InviteMemberInput,
  RevokeInvitationInput,
} from "@/modules/users/schemas/invitation.schema"
import type { ClinicInvitation } from "@/modules/users/types/invitation"

export type InviteMemberDto = InviteMemberInput
export type RevokeInvitationDto = RevokeInvitationInput
export type AcceptInvitationDto = AcceptInvitationInput
export type ClinicInvitationResult = ClinicInvitation
