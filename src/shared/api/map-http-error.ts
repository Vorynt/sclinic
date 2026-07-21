import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"
import type { ApiErrorPayload } from "@/types/api"

function statusToCode(status: number): string {
  if (status === 400) return ErrorCode.VALIDATION_FAILED
  if (status === 401) return ErrorCode.UNAUTHORIZED
  if (status === 403) return ErrorCode.FORBIDDEN
  if (status === 404) return ErrorCode.NOT_FOUND
  if (status === 409) return ErrorCode.CONFLICT
  return ErrorCode.INTERNAL_ERROR
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.code === "string" && typeof candidate.message === "string"
}

/**
 * Maps an HTTP Response failure into an AppError (throw for React Query / callers).
 */
export async function mapHttpError(response: Response): Promise<never> {
  let body: unknown

  try {
    body = await response.json()
  } catch {
    body = undefined
  }

  const payload =
    body && typeof body === "object" && "error" in body
      ? (body as { error: unknown }).error
      : body

  if (isApiErrorPayload(payload)) {
    throw new AppError(payload.code, {
      message: payload.message,
      meta: { status: response.status, fields: payload.fields },
    })
  }

  throw new AppError(statusToCode(response.status), {
    message: `HTTP ${response.status}`,
    meta: { status: response.status },
  })
}
