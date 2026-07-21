export { AppError } from "@/shared/errors/app-error"
export { ErrorCode } from "@/shared/errors/codes"
export type { ErrorCode as ErrorCodeType } from "@/shared/errors/codes"
export {
  isAppError,
  isTechnicalError,
  isValidationError,
} from "@/shared/errors/guards"
export { getClientMessage } from "@/shared/errors/messages"
export { TechnicalError } from "@/shared/errors/technical-error"
export {
  toActionResult,
  unwrapActionResult,
} from "@/shared/errors/to-action-result"
export { ValidationError } from "@/shared/errors/validation-error"
