type AppErrorOptions = {
  message?: string
  meta?: Record<string, unknown>
  cause?: unknown
}

/**
 * Domain / application error — thrown by services.
 * Codes should be stable (e.g. PATIENT_NOT_FOUND) for UI and observability.
 */
export class AppError extends Error {
  readonly code: string
  readonly meta?: Record<string, unknown>

  constructor(code: string, options: AppErrorOptions = {}) {
    super(options.message ?? code, { cause: options.cause })
    this.name = "AppError"
    this.code = code
    this.meta = options.meta
  }
}
