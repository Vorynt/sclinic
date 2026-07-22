import type {
  ChangePasswordInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  SwitchClinicInput,
} from "@/modules/authentication/schemas/auth.schema";

export type SignUpDto = SignUpInput;
export type SignInDto = SignInInput;
export type SwitchClinicDto = SwitchClinicInput;
export type RequestPasswordResetDto = RequestPasswordResetInput;
export type ResetPasswordDto = ResetPasswordInput;
export type ChangePasswordDto = ChangePasswordInput;
