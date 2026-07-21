import { AppError } from "@/shared/errors/app-error"
import { TechnicalError } from "@/shared/errors/technical-error"
import { ValidationError } from "@/shared/errors/validation-error"

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isTechnicalError(error: unknown): error is TechnicalError {
  return error instanceof TechnicalError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}
