import { describe, expect, it } from "@jest/globals";

import { AppError } from "@/shared/errors/app-error";
import { ErrorCode } from "@/shared/errors/codes";
import { resolveClientMessage } from "@/shared/errors/messages";
import { TechnicalError } from "@/shared/errors/technical-error";
import {
  toActionResult,
  unwrapActionResult,
} from "@/shared/errors/to-action-result";
import { ValidationError } from "@/shared/errors/validation-error";

describe("resolveClientMessage", () => {
  it("prefers the service-provided message", () => {
    const error = new AppError(ErrorCode.CONFLICT, {
      message: "Já existe um paciente com este CPF nesta clínica.",
    });
    expect(resolveClientMessage(error)).toBe(
      "Já existe um paciente com este CPF nesta clínica.",
    );
  });

  it("falls back to the code map when no custom message was set", () => {
    const error = new AppError(ErrorCode.CONFLICT);
    expect(resolveClientMessage(error)).toBe(
      "Este registro já existe ou conflita com outro.",
    );
  });
});

describe("toActionResult", () => {
  it("returns the domain message for AppError conflicts", async () => {
    const result = await toActionResult(async () => {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Já existe um profissional com este registro de conselho (tipo, número e UF).",
      });
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(ErrorCode.CONFLICT);
    expect(result.error.message).toBe(
      "Já existe um profissional com este registro de conselho (tipo, número e UF).",
    );
  });

  it("keeps a stable form-level message for ValidationError", async () => {
    const result = await toActionResult(async () => {
      throw new ValidationError({ email: ["E-mail inválido"] });
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(result.error.message).toBe("Verifique os campos e tente novamente.");
    expect(result.error.fields).toEqual({ email: ["E-mail inválido"] });
  });

  it("maps unmapped unique violations to CONFLICT without leaking DB details", async () => {
    const result = await toActionResult(async () => {
      throw new TechnicalError(ErrorCode.DB_UNIQUE_VIOLATION, {
        message: "Database error 23505",
        meta: { constraint: "professionals_council_uidx" },
      });
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(ErrorCode.CONFLICT);
    expect(result.error.message).toBe(
      "Este registro já existe ou conflita com outro.",
    );
    expect(result.error.meta).toBe(undefined);
  });

  it("hides other technical errors behind INTERNAL_ERROR", async () => {
    const result = await toActionResult(async () => {
      throw new TechnicalError(ErrorCode.DB_QUERY_FAILED, {
        message: "select failed",
      });
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(result.error.message).toBe("Algo deu errado. Tente novamente.");
  });

  it("unwrap preserves the domain message for React Query", async () => {
    const result = await toActionResult(async () => {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Este e-mail já faz parte da clínica.",
      });
    });

    try {
      unwrapActionResult(result);
      throw new Error("expected to throw");
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error;
      }
      expect(
        ((error: unknown) => {
          expect(error instanceof AppError).toBeTruthy();
          if (error instanceof AppError) {
            expect(error.code).toBe(ErrorCode.CONFLICT);
            expect(error.message).toBe("Este e-mail já faz parte da clínica.");
            return true;
          }
          return false;
        })(error),
      ).toBe(true);
    }
  });
});
