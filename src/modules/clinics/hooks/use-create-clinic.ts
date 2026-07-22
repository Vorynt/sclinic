import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authQueryKeys } from "@/modules/authentication/queries/auth.query"
import { clinicMutations } from "@/modules/clinics/mutations/clinics.mutation"
import type { Clinic } from "@/modules/clinics/types/clinic"
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

export function useCreateClinicMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Clinic> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicMutations.create(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
