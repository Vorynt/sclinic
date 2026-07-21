import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"

type ValidationErrorOptions = {
  message?: string
  meta?: Record<string, unknown>
  cause?: unknown
}

/**
 * Input validation error — typically thrown by actions after schema parse.
 */
export class ValidationError extends AppError {
  readonly fields: Record<string, string[]>

  constructor(
    fields: Record<string, string[]>,
    options: ValidationErrorOptions = {},
  ) {
    super(ErrorCode.VALIDATION_FAILED, {
      message: options.message ?? "Validation failed",
      meta: options.meta,
      cause: options.cause,
    })
    this.name = "ValidationError"
    this.fields = fields
  }
}
