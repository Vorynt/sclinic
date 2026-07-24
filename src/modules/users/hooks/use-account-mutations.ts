"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authQueryKeys } from "@/modules/authentication/queries/auth.query"
import { accountMutations } from "@/modules/users/mutations/account.mutation"
import { accountQueryKeys } from "@/modules/users/queries/account.query"
import type { AccountProfile } from "@/modules/users/types/account"
import {
  AppError,
  ErrorCode,
  getClientMessage,
  isAppError,
} from "@/shared/errors"
import type { MutationCallbacks } from "@/types/mutation"

function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  return new AppError(ErrorCode.INTERNAL_ERROR, {
    message: getClientMessage(ErrorCode.INTERNAL_ERROR),
    cause: error,
  })
}

export function useUpdateAccountProfileMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AccountProfile> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...accountMutations.updateProfile(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: accountQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
