import { NeonDbError } from "@neondatabase/serverless"

import { isAppError, isTechnicalError } from "@/shared/errors/guards"
import { ErrorCode } from "@/shared/errors/codes"
import { TechnicalError } from "@/shared/errors/technical-error"

/** Postgres SQLSTATE → technical error code */
const PG_CODE_TO_ERROR: Record<string, string> = {
  "23505": ErrorCode.DB_UNIQUE_VIOLATION,
  "23503": ErrorCode.DB_FOREIGN_KEY_VIOLATION,
  "23502": ErrorCode.DB_NOT_NULL_VIOLATION,
}

const PG_CONNECTION_CODES = new Set([
  "08000",
  "08001",
  "08003",
  "08004",
  "08006",
  "57P01",
  "57P02",
  "57P03",
])

type DbErrorMeta = {
  pgCode?: string
  constraint?: string
  table?: string
  column?: string
  schema?: string
}

function isNeonDbError(error: unknown): error is NeonDbError {
  return error instanceof NeonDbError
}

function readStringField(
  value: object,
  key: string,
): string | undefined {
  if (!(key in value)) return undefined
  const field = (value as Record<string, unknown>)[key]
  return typeof field === "string" ? field : undefined
}

/**
 * Walks error / cause / sourceError to find a Postgres SQLSTATE (5 chars).
 */
function extractPostgresCode(error: unknown): string | undefined {
  let current: unknown = error

  for (let depth = 0; depth < 6 && current; depth += 1) {
    if (isNeonDbError(current) && current.code) {
      return current.code
    }

    if (typeof current === "object" && current !== null) {
      const code = readStringField(current, "code")
      if (code && /^\d{5}$/.test(code)) {
        return code
      }

      const sourceError = (current as { sourceError?: unknown }).sourceError
      if (sourceError) {
        current = sourceError
        continue
      }
    }

    if (current instanceof Error && current.cause) {
      current = current.cause
      continue
    }

    break
  }

  return undefined
}

function extractDbMeta(error: unknown): DbErrorMeta {
  let current: unknown = error
  const meta: DbErrorMeta = {}

  for (let depth = 0; depth < 6 && current; depth += 1) {
    if (typeof current === "object" && current !== null) {
      meta.pgCode ??= readStringField(current, "code")
      meta.constraint ??= readStringField(current, "constraint")
      meta.table ??= readStringField(current, "table")
      meta.column ??= readStringField(current, "column")
      meta.schema ??= readStringField(current, "schema")

      if (isNeonDbError(current) || meta.constraint || meta.table) {
        break
      }

      const sourceError = (current as { sourceError?: unknown }).sourceError
      if (sourceError) {
        current = sourceError
        continue
      }
    }

    if (current instanceof Error && current.cause) {
      current = current.cause
      continue
    }

    break
  }

  return meta
}

function looksLikeConnectionFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes("fetch failed") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("network") ||
    message.includes("connect")
  )
}

/**
 * Maps Drizzle / Neon / Postgres failures to TechnicalError.
 * Passes through AppError and TechnicalError unchanged.
 */
export function mapDbError(error: unknown): TechnicalError {
  if (isTechnicalError(error)) {
    return error
  }

  if (isAppError(error)) {
    throw error
  }

  const pgCode = extractPostgresCode(error)
  const meta = extractDbMeta(error)

  if (pgCode && PG_CONNECTION_CODES.has(pgCode)) {
    return new TechnicalError(ErrorCode.DB_CONNECTION_FAILED, {
      message: "Database connection failed",
      meta: { ...meta, pgCode },
      cause: error,
    })
  }

  if (pgCode && PG_CODE_TO_ERROR[pgCode]) {
    return new TechnicalError(PG_CODE_TO_ERROR[pgCode], {
      message: `Database error ${pgCode}`,
      meta: { ...meta, pgCode },
      cause: error,
    })
  }

  if (looksLikeConnectionFailure(error)) {
    return new TechnicalError(ErrorCode.DB_CONNECTION_FAILED, {
      message: "Database connection failed",
      meta,
      cause: error,
    })
  }

  return new TechnicalError(ErrorCode.DB_QUERY_FAILED, {
    message: error instanceof Error ? error.message : "Database query failed",
    meta: pgCode ? { ...meta, pgCode } : meta,
    cause: error,
  })
}

/**
 * Wraps a repository DB operation: any raw driver/ORM error becomes TechnicalError.
 *
 * @example
 * return withDbError(async () => {
 *   const [row] = await db.insert(patients).values(...).returning()
 *   return toPatient(row)
 * })
 */
export async function withDbError<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isAppError(error)) {
      throw error
    }
    throw mapDbError(error)
  }
}
