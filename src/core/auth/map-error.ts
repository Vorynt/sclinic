import { APIError } from "better-auth"

import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"

const BA_TO_APP: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: ErrorCode.INVALID_CREDENTIALS,
  INVALID_PASSWORD: ErrorCode.INVALID_CURRENT_PASSWORD,
  USER_NOT_FOUND: ErrorCode.INVALID_CREDENTIALS,
  CREDENTIAL_ACCOUNT_NOT_FOUND: ErrorCode.INVALID_CREDENTIALS,
  USER_ALREADY_EXISTS: ErrorCode.EMAIL_ALREADY_EXISTS,
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: ErrorCode.EMAIL_ALREADY_EXISTS,
  EMAIL_NOT_VERIFIED: ErrorCode.EMAIL_NOT_VERIFIED,
  SESSION_EXPIRED: ErrorCode.SESSION_EXPIRED,
  INVALID_TOKEN: ErrorCode.INVALID_TOKEN,
  TOKEN_EXPIRED: ErrorCode.TOKEN_EXPIRED,
  INVALID_CODE: ErrorCode.TWO_FACTOR_INVALID_CODE,
  INVALID_BACKUP_CODE: ErrorCode.TWO_FACTOR_INVALID_CODE,
  ACCOUNT_TEMPORARILY_LOCKED: ErrorCode.TWO_FACTOR_LOCKED,
  INVALID_TWO_FACTOR_COOKIE: ErrorCode.TWO_FACTOR_COOKIE_INVALID,
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: ErrorCode.TWO_FACTOR_COOKIE_INVALID,
}

function readBaCode(error: APIError): string | undefined {
  const body = error.body
  if (body && typeof body === "object" && "code" in body) {
    const code = (body as { code?: unknown }).code
    return typeof code === "string" ? code : undefined
  }
  return undefined
}

/**
 * Maps Better Auth APIError → AppError. Re-throws unknown errors.
 */
export function mapBetterAuthError(error: unknown): never {
  if (error instanceof APIError) {
    const baCode = readBaCode(error)
    const appCode =
      (baCode && BA_TO_APP[baCode]) ||
      (error.statusCode === 401
        ? ErrorCode.UNAUTHORIZED
        : error.statusCode === 429
          ? ErrorCode.TWO_FACTOR_LOCKED
          : ErrorCode.INTERNAL_ERROR)

    throw new AppError(appCode, {
      cause: error,
      meta: baCode ? { betterAuthCode: baCode } : undefined,
    })
  }

  throw error
}

export function isBetterAuthError(error: unknown): error is APIError {
  return error instanceof APIError
}
