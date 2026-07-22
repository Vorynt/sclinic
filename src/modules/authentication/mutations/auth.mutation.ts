import { mutationOptions } from "@tanstack/react-query"

import { changePasswordAction } from "@/modules/authentication/actions/change-password"
import { requestPasswordResetAction } from "@/modules/authentication/actions/request-password-reset"
import { resetPasswordAction } from "@/modules/authentication/actions/reset-password"
import { signInAction } from "@/modules/authentication/actions/sign-in"
import { signOutAction } from "@/modules/authentication/actions/sign-out"
import { signUpAction } from "@/modules/authentication/actions/sign-up"
import { switchClinicAction } from "@/modules/authentication/actions/switch-clinic"
import type {
  ChangePasswordDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  SwitchClinicDto,
} from "@/modules/authentication/dto/auth.dto"
import { unwrapActionResult } from "@/shared/errors"

export const authMutationKeys = {
  signUp: ["authentication", "sign-up"] as const,
  signIn: ["authentication", "sign-in"] as const,
  signOut: ["authentication", "sign-out"] as const,
  switchClinic: ["authentication", "switch-clinic"] as const,
  requestPasswordReset: ["authentication", "request-password-reset"] as const,
  resetPassword: ["authentication", "reset-password"] as const,
  changePassword: ["authentication", "change-password"] as const,
}

export const authMutations = {
  signUp: () =>
    mutationOptions({
      mutationKey: authMutationKeys.signUp,
      mutationFn: async (data: SignUpDto) =>
        unwrapActionResult(await signUpAction(data)),
    }),

  signIn: () =>
    mutationOptions({
      mutationKey: authMutationKeys.signIn,
      mutationFn: async (data: SignInDto) =>
        unwrapActionResult(await signInAction(data)),
    }),

  signOut: () =>
    mutationOptions({
      mutationKey: authMutationKeys.signOut,
      mutationFn: async () => unwrapActionResult(await signOutAction()),
    }),

  switchClinic: () =>
    mutationOptions({
      mutationKey: authMutationKeys.switchClinic,
      mutationFn: async (data: SwitchClinicDto) =>
        unwrapActionResult(await switchClinicAction(data)),
    }),

  requestPasswordReset: () =>
    mutationOptions({
      mutationKey: authMutationKeys.requestPasswordReset,
      mutationFn: async (data: RequestPasswordResetDto) =>
        unwrapActionResult(await requestPasswordResetAction(data)),
    }),

  resetPassword: () =>
    mutationOptions({
      mutationKey: authMutationKeys.resetPassword,
      mutationFn: async (data: ResetPasswordDto) =>
        unwrapActionResult(await resetPasswordAction(data)),
    }),

  changePassword: () =>
    mutationOptions({
      mutationKey: authMutationKeys.changePassword,
      mutationFn: async (data: ChangePasswordDto) =>
        unwrapActionResult(await changePasswordAction(data)),
    }),
}
