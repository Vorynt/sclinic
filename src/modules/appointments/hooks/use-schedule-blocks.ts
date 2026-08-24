"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { scheduleBlocksMutations } from "@/modules/appointments/mutations/schedule-blocks.mutation"
import { appointmentsQueryKeys } from "@/modules/appointments/queries/appointments.query"
import {
  scheduleBlocksQueries,
  scheduleBlocksQueryKeys,
  type ScheduleBlocksRangeFilters,
} from "@/modules/appointments/queries/schedule-blocks.query"
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block"
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

export function useScheduleBlocksQuery(filters: ScheduleBlocksRangeFilters) {
  return useQuery(scheduleBlocksQueries.list(filters))
}

export function useCreateScheduleBlockMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ScheduleBlock> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...scheduleBlocksMutations.create(),
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: scheduleBlocksQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: appointmentsQueryKeys.calendarRanges(),
        }),
      ])
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useDeleteScheduleBlockMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ScheduleBlock> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...scheduleBlocksMutations.delete(),
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: scheduleBlocksQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: appointmentsQueryKeys.calendarRanges(),
        }),
      ])
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
