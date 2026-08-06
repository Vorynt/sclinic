"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { professionalHoursMutations } from "@/modules/professionals/mutations/professional-hours.mutation"
import {
  professionalHoursQueries,
  professionalHoursQueryKeys,
} from "@/modules/professionals/queries/professional-hours.query"
import type { ProfessionalWeeklyHours } from "@/modules/professionals/types/professional-hours"
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

export function useProfessionalHoursQuery(
  professionalId: string,
  enabled = true,
) {
  return useQuery({
    ...professionalHoursQueries.detail(professionalId),
    enabled: enabled && Boolean(professionalId),
  })
}

export function useUpsertProfessionalHoursMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ProfessionalWeeklyHours> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...professionalHoursMutations.upsert(),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: professionalHoursQueryKeys.detail(variables.professionalId),
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
