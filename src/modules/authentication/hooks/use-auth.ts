import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { setQueryClinicId } from "@/lib/query-clinic-scope";
import { authMutations } from "@/modules/authentication/mutations/auth.mutation";
import {
  authQueries,
  authQueryKeys,
} from "@/modules/authentication/queries/auth.query";
import type {
  AuthContext,
  BackupCodesResult,
  SignInResult,
  TwoFactorEnableResult,
} from "@/modules/authentication/types/auth";
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

export function useAuthSessions() {
  return useQuery(authQueries.sessions());
}

export function useSignInMutation({
  onSuccess,
  onError,
}: MutationCallbacks<SignInResult> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.signIn(),
    onSuccess: async (data) => {
      if (data.status === "authenticated") {
        // Seed session before invalidate so permissions are available on redirect
        // (AuthProvider was hydrated with null on /login and does not remount).
        setQueryClinicId(data.context.session.activeClinicId ?? null);
        queryClient.setQueryData(authQueryKeys.session, data.context);
        await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      }
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
    onSuccess: (data) => {
      // Wipe the entire client cache so domain data cannot leak across sessions.
      setQueryClinicId(null);
      queryClient.clear();
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
    onSuccess: (data) => {
      // Scope hash to the new clinic, drop all cached entries (incl. orphans from
      // the previous clinic), then reseed session so we do not refetch it.
      // Mounted domain queries cold-fetch under the new scope — no global invalidate storm.
      setQueryClinicId(data.session.activeClinicId ?? null);
      queryClient.clear();
      queryClient.setQueryData(authQueryKeys.session, data);
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
      queryClient.setQueryData(authQueryKeys.session, data);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useRequestPasswordResetMutation({
  onSuccess,
  onError,
}: MutationCallbacks = {}) {
  return useMutation({
    ...authMutations.requestPasswordReset(),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useResetPasswordMutation({
  onSuccess,
  onError,
}: MutationCallbacks = {}) {
  return useMutation({
    ...authMutations.resetPassword(),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

function seedAuthenticatedSession(
  queryClient: ReturnType<typeof useQueryClient>,
  data: AuthContext,
) {
  setQueryClinicId(data.session.activeClinicId ?? null);
  queryClient.setQueryData(authQueryKeys.session, data);
}

export function useVerifyTwoFactorMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.verifyTwoFactor(),
    onSuccess: async (data) => {
      seedAuthenticatedSession(queryClient, data);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useVerifyBackupCodeMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.verifyBackupCode(),
    onSuccess: async (data) => {
      seedAuthenticatedSession(queryClient, data);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useEnableTwoFactorMutation({
  onSuccess,
  onError,
}: MutationCallbacks<TwoFactorEnableResult> = {}) {
  return useMutation({
    ...authMutations.enableTwoFactor(),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useVerifyTwoFactorSetupMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.verifyTwoFactorSetup(),
    onSuccess: async (data) => {
      queryClient.setQueryData(authQueryKeys.session, data);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useDisableTwoFactorMutation({
  onSuccess,
  onError,
}: MutationCallbacks<AuthContext> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.disableTwoFactor(),
    onSuccess: async (data) => {
      queryClient.setQueryData(authQueryKeys.session, data);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useRegenerateBackupCodesMutation({
  onSuccess,
  onError,
}: MutationCallbacks<BackupCodesResult> = {}) {
  return useMutation({
    ...authMutations.regenerateBackupCodes(),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useRevokeSessionMutation({
  onSuccess,
  onError,
}: MutationCallbacks = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.revokeSession(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.sessions,
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}

export function useRevokeOtherSessionsMutation({
  onSuccess,
  onError,
}: MutationCallbacks = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...authMutations.revokeOtherSessions(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.sessions,
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(toAppError(error));
    },
  });
}
