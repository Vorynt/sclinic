import { mutationOptions } from "@tanstack/react-query"

import { acceptProfessionalInviteAction } from "@/modules/professionals/actions/accept-professional-invite"
import { createProfessionalAction } from "@/modules/professionals/actions/create-professional"
import { deleteProfessionalAction } from "@/modules/professionals/actions/delete-professional"
import { setProfessionalStatusAction } from "@/modules/professionals/actions/set-professional-status"
import { updateProfessionalAction } from "@/modules/professionals/actions/update-professional"
import { updateProfessionalInviteProfileAction } from "@/modules/professionals/actions/update-professional-invite-profile"
import type { CreateProfessionalDto } from "@/modules/professionals/dto/create-professional.dto"
import type {
  ProfessionalInviteTokenDto,
  SetProfessionalStatusDto,
  UpdateProfessionalInviteProfileDto,
} from "@/modules/professionals/dto/professional.dto"
import type { UpdateProfessionalDto } from "@/modules/professionals/dto/update-professional.dto"
import { unwrapActionResult } from "@/shared/errors"

export const professionalsMutationKeys = {
  create: ["professionals", "create"] as const,
  update: ["professionals", "update"] as const,
  setStatus: ["professionals", "set-status"] as const,
  delete: ["professionals", "delete"] as const,
  updateInviteProfile: ["professionals", "update-invite-profile"] as const,
  acceptInvite: ["professionals", "accept-invite"] as const,
}

export const professionalsMutations = {
  create: () =>
    mutationOptions({
      mutationKey: professionalsMutationKeys.create,
      mutationFn: async (data: CreateProfessionalDto) =>
        unwrapActionResult(await createProfessionalAction(data)),
    }),

  update: () =>
    mutationOptions({
      mutationKey: professionalsMutationKeys.update,
      mutationFn: async (data: UpdateProfessionalDto) =>
        unwrapActionResult(await updateProfessionalAction(data)),
    }),

  setStatus: () =>
    mutationOptions({
      mutationKey: professionalsMutationKeys.setStatus,
      mutationFn: async (data: SetProfessionalStatusDto) =>
        unwrapActionResult(await setProfessionalStatusAction(data)),
    }),

  delete: () =>
    mutationOptions({
      mutationKey: professionalsMutationKeys.delete,
      mutationFn: async (id: string) =>
        unwrapActionResult(await deleteProfessionalAction({ id })),
    }),

  updateInviteProfile: () =>
    mutationOptions({
      mutationKey: professionalsMutationKeys.updateInviteProfile,
      mutationFn: async (data: UpdateProfessionalInviteProfileDto) =>
        unwrapActionResult(
          await updateProfessionalInviteProfileAction(data),
        ),
    }),

  acceptInvite: () =>
    mutationOptions({
      mutationKey: professionalsMutationKeys.acceptInvite,
      mutationFn: async (data: ProfessionalInviteTokenDto) =>
        unwrapActionResult(await acceptProfessionalInviteAction(data)),
    }),
}
