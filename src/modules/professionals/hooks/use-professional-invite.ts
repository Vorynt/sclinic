"use client"

/**
 * Invite-flow hooks with the names preferred by the UI layer.
 * Delegates to the shared professionals query/mutation hooks.
 */
export { useProfessionalInvitePreview as useProfessionalInvitePreviewQuery } from "@/modules/professionals/hooks/use-professional"

export {
  useAcceptProfessionalInviteMutation,
  useUpdateProfessionalInviteProfileMutation,
} from "@/modules/professionals/hooks/use-professional-mutations"
