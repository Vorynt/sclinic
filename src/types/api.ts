export type ApiErrorPayload = {
  code: string
  message: string
  fields?: Record<string, string[]>
  /** Client-safe domain extras (e.g. suggested appointment slots). */
  meta?: Record<string, unknown>
}

export type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: ApiErrorPayload
    }
