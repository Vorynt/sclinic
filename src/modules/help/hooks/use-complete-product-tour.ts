"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authQueryKeys } from "@/modules/authentication/queries/auth.query"
import { helpMutations } from "@/modules/help/mutations/product-tour.mutation"
import type { AuthContext } from "@/shared/auth"
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

export function useCompleteProductTourMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...helpMutations.completeProductTour(),
    onSuccess: async (data) => {
      queryClient.setQueryData(authQueryKeys.session, data)
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
