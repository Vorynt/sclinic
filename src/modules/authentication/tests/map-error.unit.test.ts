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
})
