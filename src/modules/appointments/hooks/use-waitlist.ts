"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { appointmentsQueryKeys } from "@/modules/appointments/queries/appointments.query"
import {
  waitlistQueries,
  waitlistQueryKeys,
  type WaitlistFilters,
} from "@/modules/appointments/queries/waitlist.query"
import { waitlistMutations } from "@/modules/appointments/mutations/waitlist.mutation"
import type { WaitlistEntry } from "@/modules/appointments/types/waitlist"
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

export function useWaitlistQuery(filters: WaitlistFilters = {}) {
  return useQuery(waitlistQueries.list(filters))
}

export function useEnqueueWaitlistMutation({
  onSuccess,
  onError,
}: MutationCallbacks<WaitlistEntry> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...waitlistMutations.enqueue(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: waitlistQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useCancelWaitlistMutation({
  onSuccess,
  onError,
}: MutationCallbacks<WaitlistEntry> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...waitlistMutations.cancel(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: waitlistQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function usePromoteWaitlistMutation({
  onSuccess,
  onError,
}: MutationCallbacks<WaitlistEntry> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...waitlistMutations.promote(),
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: waitlistQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: appointmentsQueryKeys.all,
        }),
      ])
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
