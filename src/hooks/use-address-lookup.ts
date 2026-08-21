"use client"

import { useMutation } from "@tanstack/react-query"

import { lookupAddressAction } from "@/core/address/actions/lookup-address"
import type { PostalAddress } from "@/core/address/types"
import {
  AppError,
  ErrorCode,
  getClientMessage,
  isAppError,
  unwrapActionResult,
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

export function useAddressLookup({
  onSuccess,
  onError,
}: MutationCallbacks<PostalAddress> = {}) {
  return useMutation({
    mutationKey: ["address", "lookup"],
    mutationFn: async (zip: string) =>
      unwrapActionResult(await lookupAddressAction({ zip })),
    onSuccess,
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
