import { logger } from "@/core/logger";
import { AppError } from "@/shared/errors/app-error";
import { ErrorCode } from "@/shared/errors/codes";
import {
  isAppError,
  isTechnicalError,
  isValidationError,
} from "@/shared/errors/guards";
import { getClientMessage } from "@/shared/errors/messages";
import type { ApiErrorPayload, ApiResponse } from "@/types/api";

function toErrorPayload(error: unknown): ApiErrorPayload {
  if (isValidationError(error)) {
    return {
      code: error.code,
      message: getClientMessage(error.code),
      fields: error.fields,
    };
  }

  if (isAppError(error)) {
    return {
      code: error.code,
      message: getClientMessage(error.code),
    };
  }

  // Technical (and unknown) errors never leak internals to the client
  if (isTechnicalError(error)) {
    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: getClientMessage(ErrorCode.INTERNAL_ERROR),
    };
  }

  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: getClientMessage(ErrorCode.INTERNAL_ERROR),
  };
}

function logFailure(error: unknown): void {
  if (isTechnicalError(error) || isAppError(error)) {
    logger.error(
      {
        code: error.code,
        meta: error.meta,
        cause: error.cause,
      },
      error.message,
    );
    return;
  }

  logger.error(
    { cause: error },
    error instanceof Error ? error.message : "Unknown error",
  );
}

/**
 * Boundary helper for Server Actions.
 * Internals throw; actions return ApiResponse for the UI.
 */
export async function toActionResult<T>(
  fn: () => Promise<T>,
): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    logFailure(error);
    return { success: false, error: toErrorPayload(error) };
  }
}

/**
 * Turns ApiResponse into a throw for React Query (queryFn / mutationFn).
 */
export function unwrapActionResult<T>(result: ApiResponse<T>): T {
  if (result.success) {
    return result.data;
  }

  throw new AppError(result.error.code, {
    message: result.error.message,
    meta: result.error.fields ? { fields: result.error.fields } : undefined,
  });
}
