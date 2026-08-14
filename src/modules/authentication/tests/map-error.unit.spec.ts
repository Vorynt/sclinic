import { describe, expect, it } from "@jest/globals"

import { APIError } from "better-auth"

import { mapBetterAuthError } from "@/core/auth/map-error"
import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"

describe("mapBetterAuthError", () => {
  it("maps invalid credentials", () => {
    try {
      mapBetterAuthError(
        new APIError("UNAUTHORIZED", {
          message: "Invalid",
          code: "INVALID_EMAIL_OR_PASSWORD",
        }),
      )
      throw new Error("expected to throw")
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe(ErrorCode.INVALID_CREDENTIALS)
    }
  })

  it("maps wrong current password", () => {
    try {
      mapBetterAuthError(
        new APIError("BAD_REQUEST", {
          message: "Invalid password",
          code: "INVALID_PASSWORD",
        }),
      )
      throw new Error("expected to throw")
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe(ErrorCode.INVALID_CURRENT_PASSWORD)
    }
  })

  it("maps email already exists", () => {
    try {
      mapBetterAuthError(
        new APIError("UNPROCESSABLE_ENTITY", {
          message: "Exists",
          code: "USER_ALREADY_EXISTS",
        }),
      )
      throw new Error("expected to throw")
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe(ErrorCode.EMAIL_ALREADY_EXISTS)
    }
  })

  it("rethrows unknown errors", () => {
    try {
      mapBetterAuthError(new Error("boom"))
      throw new Error("expected to throw")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe("boom")
    }
  })

  it("maps invalid 2FA code", () => {
    try {
      mapBetterAuthError(
        new APIError("UNAUTHORIZED", {
          message: "Invalid",
          code: "INVALID_CODE",
        }),
      )
      throw new Error("expected to throw")
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe(ErrorCode.TWO_FACTOR_INVALID_CODE)
    }
  })

  it("maps locked 2FA account", () => {
    try {
      mapBetterAuthError(
        new APIError("TOO_MANY_REQUESTS", {
          message: "Locked",
          code: "ACCOUNT_TEMPORARILY_LOCKED",
        }),
      )
      throw new Error("expected to throw")
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe(ErrorCode.TWO_FACTOR_LOCKED)
    }
  })

  it("maps invalid backup code", () => {
    try {
      mapBetterAuthError(
        new APIError("UNAUTHORIZED", {
          message: "Invalid backup",
          code: "INVALID_BACKUP_CODE",
        }),
      )
      throw new Error("expected to throw")
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe(ErrorCode.TWO_FACTOR_INVALID_CODE)
    }
  })

  it("maps expired 2FA challenge cookie", () => {
    try {
      mapBetterAuthError(
        new APIError("UNAUTHORIZED", {
          message: "Cookie",
          code: "INVALID_TWO_FACTOR_COOKIE",
        }),
      )
      throw new Error("expected to throw")
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe(ErrorCode.TWO_FACTOR_COOKIE_INVALID)
    }
  })
})
