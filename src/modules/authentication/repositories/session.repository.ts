import { eq } from "drizzle-orm"

import { db } from "@/db"
import { session } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toAuthSession } from "@/modules/authentication/mappers/auth.mapper"
import type { AuthSession } from "@/modules/authentication/types/auth"

export const sessionRepository = {
  async findById(id: string): Promise<AuthSession | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(session)
        .where(eq(session.id, id))
        .limit(1)
      return row ? toAuthSession(row) : null
    })
  },

  async findByToken(token: string): Promise<AuthSession | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(session)
        .where(eq(session.token, token))
        .limit(1)
      return row ? toAuthSession(row) : null
    })
  },

  async updateActiveClinicId(
    sessionId: string,
    activeClinicId: string | null,
  ): Promise<AuthSession | null> {
    return withDbError(async () => {
      const [row] = await db
        .update(session)
        .set({ activeClinicId })
        .where(eq(session.id, sessionId))
        .returning()
      return row ? toAuthSession(row) : null
    })
  },
}
