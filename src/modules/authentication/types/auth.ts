import type {
  AuthContext,
  AuthMembership,
  AuthSession,
  AuthUser,
  MembershipStatus,
  UserStatus,
} from "@/shared/auth"

export type {
  AuthContext,
  AuthMembership,
  AuthSession,
  AuthUser,
  MembershipStatus,
  UserStatus,
}

export type AuthSessionPayload = AuthContext

export type SignInResult =
  | { status: "authenticated"; context: AuthContext }
  | { status: "twoFactorRequired" }

export type AuthSessionDevice = {
  id: string
  createdAt: Date
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  isCurrent: boolean
}

export type TwoFactorEnableResult = {
  totpURI: string
  backupCodes: string[]
}

export type BackupCodesResult = {
  backupCodes: string[]
}
