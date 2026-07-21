import { pgRole } from "drizzle-orm/pg-core"

/**
 * Application DB role that must obey RLS.
 * Marked existing so drizzle-kit does not try to create it on Neon;
 * provision via `src/db/sql/001_app_role.sql` (or Neon SQL editor).
 *
 * Table owners bypass RLS unless FORCE ROW LEVEL SECURITY is set
 * (`src/db/sql/002_force_rls.sql`).
 */
export const sclinicAppRole = pgRole("sclinic_app").existing()
