import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authQueryKeys } from "@/modules/authentication/queries/auth.query"
import type { AuthContext } from "@/modules/authentication/types/auth"
import { usersMutations } from "@/modules/users/mutations/users.mutation"
import { usersQueryKeys } from "@/modules/users/queries/users.query"
import type { ClinicInvitation } from "@/modules/users/types/invitation"
import type { ClinicMember } from "@/modules/users/types/member"
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

export function useInviteMemberMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ClinicInvitation> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...usersMutations.invite(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useRevokeInvitationMutation({
  onSuccess,
  onError,
}: MutationCallbacks<null> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...usersMutations.revokeInvitation(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: usersQueryKeys.invitations(),
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useAcceptInvitationMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ClinicMember> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...usersMutations.acceptInvitation(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useSetPasswordFromInviteMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...usersMutations.setPasswordFromInvite(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpdateMemberRoleMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ClinicMember> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...usersMutations.updateRole(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.members() })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useRemoveMemberMutation({
  onSuccess,
  onError,
}: MutationCallbacks<null> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...usersMutations.removeMember(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.members() })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
