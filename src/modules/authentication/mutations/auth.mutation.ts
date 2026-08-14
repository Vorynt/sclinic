import { mutationOptions } from "@tanstack/react-query"

import { changePasswordAction } from "@/modules/authentication/actions/change-password"
import { disableTwoFactorAction } from "@/modules/authentication/actions/disable-two-factor"
import { enableTwoFactorAction } from "@/modules/authentication/actions/enable-two-factor"
import { regenerateBackupCodesAction } from "@/modules/authentication/actions/regenerate-backup-codes"
import { requestPasswordResetAction } from "@/modules/authentication/actions/request-password-reset"
import { resendVerificationEmailAction } from "@/modules/authentication/actions/resend-verification-email"
import { resetPasswordAction } from "@/modules/authentication/actions/reset-password"
import { revokeOtherSessionsAction } from "@/modules/authentication/actions/revoke-other-sessions"
import { revokeSessionAction } from "@/modules/authentication/actions/revoke-session"
import { signInAction } from "@/modules/authentication/actions/sign-in"
import { signOutAction } from "@/modules/authentication/actions/sign-out"
import { signUpAction } from "@/modules/authentication/actions/sign-up"
import { switchClinicAction } from "@/modules/authentication/actions/switch-clinic"
import { verifyBackupCodeAction } from "@/modules/authentication/actions/verify-backup-code"
import { verifyTwoFactorAction } from "@/modules/authentication/actions/verify-two-factor"
import { verifyTwoFactorSetupAction } from "@/modules/authentication/actions/verify-two-factor-setup"
import type {
  ChangePasswordDto,
  DisableTwoFactorDto,
  EnableTwoFactorDto,
  RegenerateBackupCodesDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  RevokeSessionDto,
  SignInDto,
  SignUpDto,
  SwitchClinicDto,
  VerifyBackupCodeDto,
  VerifyTotpDto,
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
  resendVerificationEmail: [
    "authentication",
    "resend-verification-email",
  ] as const,
  verifyTwoFactor: ["authentication", "verify-two-factor"] as const,
  verifyBackupCode: ["authentication", "verify-backup-code"] as const,
  enableTwoFactor: ["authentication", "enable-two-factor"] as const,
  verifyTwoFactorSetup: ["authentication", "verify-two-factor-setup"] as const,
  disableTwoFactor: ["authentication", "disable-two-factor"] as const,
  regenerateBackupCodes: ["authentication", "regenerate-backup-codes"] as const,
  revokeSession: ["authentication", "revoke-session"] as const,
  revokeOtherSessions: ["authentication", "revoke-other-sessions"] as const,
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

  resendVerificationEmail: () =>
    mutationOptions({
      mutationKey: authMutationKeys.resendVerificationEmail,
      mutationFn: async () =>
        unwrapActionResult(await resendVerificationEmailAction()),
    }),

  verifyTwoFactor: () =>
    mutationOptions({
      mutationKey: authMutationKeys.verifyTwoFactor,
      mutationFn: async (data: VerifyTotpDto) =>
        unwrapActionResult(await verifyTwoFactorAction(data)),
    }),

  verifyBackupCode: () =>
    mutationOptions({
      mutationKey: authMutationKeys.verifyBackupCode,
      mutationFn: async (data: VerifyBackupCodeDto) =>
        unwrapActionResult(await verifyBackupCodeAction(data)),
    }),

  enableTwoFactor: () =>
    mutationOptions({
      mutationKey: authMutationKeys.enableTwoFactor,
      mutationFn: async (data: EnableTwoFactorDto) =>
        unwrapActionResult(await enableTwoFactorAction(data)),
    }),

  verifyTwoFactorSetup: () =>
    mutationOptions({
      mutationKey: authMutationKeys.verifyTwoFactorSetup,
      mutationFn: async (data: VerifyTotpDto) =>
        unwrapActionResult(await verifyTwoFactorSetupAction(data)),
    }),

  disableTwoFactor: () =>
    mutationOptions({
      mutationKey: authMutationKeys.disableTwoFactor,
      mutationFn: async (data: DisableTwoFactorDto) =>
        unwrapActionResult(await disableTwoFactorAction(data)),
    }),

  regenerateBackupCodes: () =>
    mutationOptions({
      mutationKey: authMutationKeys.regenerateBackupCodes,
      mutationFn: async (data: RegenerateBackupCodesDto) =>
        unwrapActionResult(await regenerateBackupCodesAction(data)),
    }),

  revokeSession: () =>
    mutationOptions({
      mutationKey: authMutationKeys.revokeSession,
      mutationFn: async (data: RevokeSessionDto) =>
        unwrapActionResult(await revokeSessionAction(data)),
    }),

  revokeOtherSessions: () =>
    mutationOptions({
      mutationKey: authMutationKeys.revokeOtherSessions,
      mutationFn: async () =>
        unwrapActionResult(await revokeOtherSessionsAction()),
    }),
}
