import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authMutations } from "@/modules/authentication/mutations/auth.mutation"
import { authQueries, authQueryKeys } from "@/modules/authentication/queries/auth.query"

export function useAuthSession() {
  return useQuery(authQueries.session())
}

export function useAuthMemberships() {
  return useQuery(authQueries.memberships())
}

export function useSignInMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    ...authMutations.signIn(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
    },
  })
}

export function useSignUpMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    ...authMutations.signUp(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    ...authMutations.signOut(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
    },
  })
}

export function useSwitchClinicMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    ...authMutations.switchClinic(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
    },
  })
}
