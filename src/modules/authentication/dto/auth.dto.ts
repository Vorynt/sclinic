import type {
  ChangePasswordInput,
  DisableTwoFactorInput,
  EnableTwoFactorInput,
  RegenerateBackupCodesInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  RevokeSessionInput,
  SignInInput,
  SignUpInput,
  SwitchClinicInput,
  VerifyBackupCodeInput,
  VerifyTotpInput,
} from "@/modules/authentication/schemas/auth.schema";

export type SignUpDto = SignUpInput;
export type SignInDto = SignInInput;
export type SwitchClinicDto = SwitchClinicInput;
export type RequestPasswordResetDto = RequestPasswordResetInput;
export type ResetPasswordDto = ResetPasswordInput;
export type ChangePasswordDto = ChangePasswordInput;
export type VerifyTotpDto = VerifyTotpInput;
export type VerifyBackupCodeDto = VerifyBackupCodeInput;
export type EnableTwoFactorDto = EnableTwoFactorInput;
export type DisableTwoFactorDto = DisableTwoFactorInput;
export type RegenerateBackupCodesDto = RegenerateBackupCodesInput;
export type RevokeSessionDto = RevokeSessionInput;
