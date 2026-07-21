import { sql } from "drizzle-orm"

import { db } from "@/db"

export type TenantContext = {
  clinicId: string
  userId: string
}

/**
 * Sets PostgreSQL session GUCs consumed by RLS policies
 * (`app.clinic_id`, `app.user_id`).
 *
 * Prefer calling inside a transaction when using a pooled / WS driver.
 * With Neon HTTP (`neon-http`), each `db.execute` is a separate request —
 * use `withTenantContext` only when the driver shares session state,
 * or rely on repository filters + migrate to `neon-serverless` Pool for RLS.
 */
export async function setTenantContext(ctx: TenantContext): Promise<void> {
  await db.execute(
    sql`select set_config('app.clinic_id', ${ctx.clinicId}, true)`,
  )
  await db.execute(
    sql`select set_config('app.user_id', ${ctx.userId}, true)`,
  )
}

/**
 * Runs `fn` after setting tenant GUCs. Useful when `db` supports
 * interactive transactions (Pool / WebSocket).
 */
export async function withTenantContext<T>(
  ctx: TenantContext,
  fn: () => Promise<T>,
): Promise<T> {
  await setTenantContext(ctx)
  return fn()
}
