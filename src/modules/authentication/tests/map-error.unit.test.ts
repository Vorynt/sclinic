import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { APIError } from "better-auth"

import { mapBetterAuthError } from "@/core/auth/map-error"
import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"

describe("mapBetterAuthError", () => {
  it("maps invalid credentials", () => {
    assert.throws(
      () =>
        mapBetterAuthError(
          new APIError("UNAUTHORIZED", {
            message: "Invalid",
            code: "INVALID_EMAIL_OR_PASSWORD",
          }),
        ),
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ErrorCode.INVALID_CREDENTIALS,
    )
  })

  it("maps wrong current password", () => {
    assert.throws(
      () =>
        mapBetterAuthError(
          new APIError("BAD_REQUEST", {
            message: "Invalid password",
            code: "INVALID_PASSWORD",
          }),
        ),
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ErrorCode.INVALID_CURRENT_PASSWORD,
    )
  })

  it("maps email already exists", () => {
    assert.throws(
      () =>
        mapBetterAuthError(
          new APIError("UNPROCESSABLE_ENTITY", {
            message: "Exists",
            code: "USER_ALREADY_EXISTS",
          }),
        ),
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ErrorCode.EMAIL_ALREADY_EXISTS,
    )
  })

  it("rethrows unknown errors", () => {
    assert.throws(
      () => mapBetterAuthError(new Error("boom")),
      (error: unknown) =>
        error instanceof Error && error.message === "boom",
    )
  })

  it("maps invalid 2FA code", () => {
    assert.throws(
      () =>
        mapBetterAuthError(
          new APIError("UNAUTHORIZED", {
            message: "Invalid",
            code: "INVALID_CODE",
          }),
        ),
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ErrorCode.TWO_FACTOR_INVALID_CODE,
    )
  })

  it("maps locked 2FA account", () => {
    assert.throws(
      () =>
        mapBetterAuthError(
          new APIError("TOO_MANY_REQUESTS", {
            message: "Locked",
            code: "ACCOUNT_TEMPORARILY_LOCKED",
          }),
        ),
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ErrorCode.TWO_FACTOR_LOCKED,
    )
  })

  it("maps invalid backup code", () => {
    assert.throws(
      () =>
        mapBetterAuthError(
          new APIError("UNAUTHORIZED", {
            message: "Invalid backup",
            code: "INVALID_BACKUP_CODE",
          }),
        ),
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ErrorCode.TWO_FACTOR_INVALID_CODE,
    )
  })

  it("maps expired 2FA challenge cookie", () => {
    assert.throws(
      () =>
        mapBetterAuthError(
          new APIError("UNAUTHORIZED", {
            message: "Cookie",
            code: "INVALID_TWO_FACTOR_COOKIE",
          }),
        ),
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ErrorCode.TWO_FACTOR_COOKIE_INVALID,
    )
  })
})
