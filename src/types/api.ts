export type ApiErrorPayload = {
  code: string
  message: string
  fields?: Record<string, string[]>
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
