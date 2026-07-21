import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import { env } from "@/config/env"
import * as schema from "@/db/schema"

const sql = neon(env.DATABASE_URL)

/**
 * Drizzle client (Neon serverless HTTP).
 * Use only from repositories — never from pages or actions directly.
 */
export const db = drizzle({ client: sql, schema })
