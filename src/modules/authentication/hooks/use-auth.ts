import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authMutations } from "@/modules/authentication/mutations/auth.mutation";
import {
  authQueries,
  authQueryKeys,
} from "@/modules/authentication/queries/auth.query";
import type { AuthContext } from "@/modules/authentication/types/auth";
import {
  AppError,
  ErrorCode,
  getClientMessage,
  isAppError,
} from "@/shared/errors";
import type { MutationCallbacks } from "@/types/mutation";

function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  return new AppError(ErrorCode.INTERNAL_ERROR, {
    message: getClientMessage(ErrorCode.INTERNAL_ERROR),
    cause: error,
  });
}

export function useAuthSession() {
  return useQuery(authQueries.session());
}

export function useAuthMemberships() {
  return useQuery(authQueries.memberships());
}

export function useSignInMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.signIn(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useSignUpMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.signUp(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useSignOutMutation({
  onSuccess,
  onError,
}: MutationCallbacks = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.signOut(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useSwitchClinicMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.switchClinic(),
    onSuccess: async (data) => {
      queryClient.setQueryData(authQueryKeys.session, data);
      // Clinic-scoped domain caches (patients, members, …) must not leak.
      await queryClient.invalidateQueries();
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useResendVerificationEmailMutation({
  onSuccess,
  onError,
}: MutationCallbacks = {}) {
  return useMutation({
    ...authMutations.resendVerificationEmail(),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useChangePasswordMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.changePassword(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}
