import { mutationOptions } from "@tanstack/react-query"

import { updateAccountProfileAction } from "@/modules/users/actions/update-account-profile"
import type { UpdateAccountProfileDto } from "@/modules/users/dto/update-account-profile.dto"
import { unwrapActionResult } from "@/shared/errors"

export const accountMutationKeys = {
  updateProfile: ["account", "update-profile"] as const,
}

export const accountMutations = {
  updateProfile: () =>
    mutationOptions({
      mutationKey: accountMutationKeys.updateProfile,
      mutationFn: async (data: UpdateAccountProfileDto) =>
        unwrapActionResult(await updateAccountProfileAction(data)),
    }),
}
