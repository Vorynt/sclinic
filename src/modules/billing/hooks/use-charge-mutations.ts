"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { chargesMutations } from "@/modules/billing/mutations/charges.mutation"
import { chargesQueryKeys } from "@/modules/billing/queries/charges.query"
import type { Charge } from "@/modules/billing/types/charge"
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

export function useCreateChargeFromAppointmentMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Charge> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...chargesMutations.createFromAppointment(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: chargesQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useMarkChargePaidMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Charge> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...chargesMutations.markPaid(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: chargesQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useCancelChargeMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Charge> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...chargesMutations.cancel(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: chargesQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
