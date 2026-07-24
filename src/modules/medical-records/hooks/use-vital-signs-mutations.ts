"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { vitalSignsMutations } from "@/modules/medical-records/mutations/vital-signs.mutation"
import { vitalSignsQueryKeys } from "@/modules/medical-records/queries/vital-signs.query"
import type { VitalSigns } from "@/modules/medical-records/types/vital-signs"
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

export function useUpsertVitalSignsMutation({
  onSuccess,
  onError,
}: MutationCallbacks<VitalSigns> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...vitalSignsMutations.upsert(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: vitalSignsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
