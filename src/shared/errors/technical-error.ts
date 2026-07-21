type TechnicalErrorOptions = {
  message?: string
  meta?: Record<string, unknown>
  cause?: unknown
}

/**
 * Technical / infrastructure error — thrown by repositories and infra.
 * Never expose details to the client; map to AppError in services when possible.
 */
export class TechnicalError extends Error {
  readonly code: string
  readonly meta?: Record<string, unknown>

  constructor(code: string, options: TechnicalErrorOptions = {}) {
    super(options.message ?? code, { cause: options.cause })
    this.name = "TechnicalError"
    this.code = code
    this.meta = options.meta
  }
}
