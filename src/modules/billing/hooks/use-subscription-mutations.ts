"use client"

import { useMutation } from "@tanstack/react-query"

import { createBillingPortalSessionAction } from "@/modules/billing/actions/create-billing-portal-session"
import { createCheckoutSessionAction } from "@/modules/billing/actions/create-checkout-session"
import { createRegularizeSessionAction } from "@/modules/billing/actions/create-regularize-session"
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

export function useCreateBillingPortalSession(
  callbacks?: MutationCallbacks<{ url: string }>,
) {
  return useMutation({
    mutationFn: async () =>
      unwrapActionResult(await createBillingPortalSessionAction()),
    onSuccess: (data) => {
      callbacks?.onSuccess?.(data)
    },
    onError: (error) => {
      callbacks?.onError?.(toAppError(error))
    },
  })
}

export function useCreateCheckoutSession(
  callbacks?: MutationCallbacks<{ url: string }>,
) {
  return useMutation({
    mutationFn: async (input: {
      planId: string
      successPath?: string
      cancelPath?: string
    }) => unwrapActionResult(await createCheckoutSessionAction(input)),
    onSuccess: (data) => {
      callbacks?.onSuccess?.(data)
    },
    onError: (error) => {
      callbacks?.onError?.(toAppError(error))
    },
  })
}

export function useCreateRegularizeSession(
  callbacks?: MutationCallbacks<{ url: string }>,
) {
  return useMutation({
    mutationFn: async (input?: {
      planId?: string
      successPath?: string
      cancelPath?: string
    }) => unwrapActionResult(await createRegularizeSessionAction(input ?? {})),
    onSuccess: (data) => {
      callbacks?.onSuccess?.(data)
    },
    onError: (error) => {
      callbacks?.onError?.(toAppError(error))
    },
  })
}
