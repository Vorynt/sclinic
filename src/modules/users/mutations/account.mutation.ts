import { mutationOptions } from "@tanstack/react-query"

import { leaveOwnClinicAction } from "@/modules/users/actions/leave-own-clinic"
import { updateAccountProfileAction } from "@/modules/users/actions/update-account-profile"
import type { LeaveOwnClinicDto } from "@/modules/users/dto/leave-own-clinic.dto"
import type { UpdateAccountProfileDto } from "@/modules/users/dto/update-account-profile.dto"
import { unwrapActionResult } from "@/shared/errors"

export const accountMutationKeys = {
  updateProfile: ["account", "update-profile"] as const,
  leaveClinic: ["account", "leave-clinic"] as const,
}

export const accountMutations = {
  updateProfile: () =>
    mutationOptions({
      mutationKey: accountMutationKeys.updateProfile,
      mutationFn: async (data: UpdateAccountProfileDto) =>
        unwrapActionResult(await updateAccountProfileAction(data)),
    }),
  leaveClinic: () =>
    mutationOptions({
      mutationKey: accountMutationKeys.leaveClinic,
      mutationFn: async (data: LeaveOwnClinicDto) =>
        unwrapActionResult(await leaveOwnClinicAction(data)),
    }),
}
