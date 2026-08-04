import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"
import { resolveClientMessage } from "@/shared/errors/messages"
import { TechnicalError } from "@/shared/errors/technical-error"
import {
  toActionResult,
  unwrapActionResult,
} from "@/shared/errors/to-action-result"
import { ValidationError } from "@/shared/errors/validation-error"

describe("resolveClientMessage", () => {
  it("prefers the service-provided message", () => {
    const error = new AppError(ErrorCode.CONFLICT, {
      message: "Já existe um paciente com este CPF nesta clínica.",
    })
    assert.equal(
      resolveClientMessage(error),
      "Já existe um paciente com este CPF nesta clínica.",
    )
  })

  it("falls back to the code map when no custom message was set", () => {
    const error = new AppError(ErrorCode.CONFLICT)
    assert.equal(
      resolveClientMessage(error),
      "Este registro já existe ou conflita com outro.",
    )
  })
})

describe("toActionResult", () => {
  it("returns the domain message for AppError conflicts", async () => {
    const result = await toActionResult(async () => {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Já existe um profissional com este registro de conselho (tipo, número e UF).",
      })
    })

    assert.equal(result.success, false)
    if (result.success) return
    assert.equal(result.error.code, ErrorCode.CONFLICT)
    assert.equal(
      result.error.message,
      "Já existe um profissional com este registro de conselho (tipo, número e UF).",
    )
  })

  it("keeps a stable form-level message for ValidationError", async () => {
    const result = await toActionResult(async () => {
      throw new ValidationError({ email: ["E-mail inválido"] })
    })

    assert.equal(result.success, false)
    if (result.success) return
    assert.equal(result.error.code, ErrorCode.VALIDATION_FAILED)
    assert.equal(
      result.error.message,
      "Verifique os campos e tente novamente.",
    )
    assert.deepEqual(result.error.fields, { email: ["E-mail inválido"] })
  })

  it("maps unmapped unique violations to CONFLICT without leaking DB details", async () => {
    const result = await toActionResult(async () => {
      throw new TechnicalError(ErrorCode.DB_UNIQUE_VIOLATION, {
        message: "Database error 23505",
        meta: { constraint: "professionals_council_uidx" },
      })
    })

    assert.equal(result.success, false)
    if (result.success) return
    assert.equal(result.error.code, ErrorCode.CONFLICT)
    assert.equal(
      result.error.message,
      "Este registro já existe ou conflita com outro.",
    )
    assert.equal(result.error.meta, undefined)
  })

  it("hides other technical errors behind INTERNAL_ERROR", async () => {
    const result = await toActionResult(async () => {
      throw new TechnicalError(ErrorCode.DB_QUERY_FAILED, {
        message: "select failed",
      })
    })

    assert.equal(result.success, false)
    if (result.success) return
    assert.equal(result.error.code, ErrorCode.INTERNAL_ERROR)
    assert.equal(result.error.message, "Algo deu errado. Tente novamente.")
  })

  it("unwrap preserves the domain message for React Query", async () => {
    const result = await toActionResult(async () => {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Este e-mail já faz parte da clínica.",
      })
    })

    assert.throws(
      () => unwrapActionResult(result),
      (error: unknown) => {
        assert.ok(error instanceof AppError)
        assert.equal(error.code, ErrorCode.CONFLICT)
        assert.equal(error.message, "Este e-mail já faz parte da clínica.")
        return true
      },
    )
  })
})
