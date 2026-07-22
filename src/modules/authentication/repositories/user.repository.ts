import { eq } from "drizzle-orm"

import { db } from "@/db"
import { user } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toAuthUser } from "@/modules/authentication/mappers/auth.mapper"
import type { AuthUser, UserStatus } from "@/modules/authentication/types/auth"

export const userRepository = {
  async findById(id: string): Promise<AuthUser | null> {
    return withDbError(async () => {
      const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1)
      return row ? toAuthUser(row) : null
    })
  },

  async findByEmail(email: string): Promise<AuthUser | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(user)
        .where(eq(user.email, email.toLowerCase()))
        .limit(1)
      return row ? toAuthUser(row) : null
    })
  },

  async updateLastLoginAt(id: string, at: Date = new Date()): Promise<void> {
    return withDbError(async () => {
      await db.update(user).set({ lastLoginAt: at }).where(eq(user.id, id))
    })
  },

  async updateStatus(id: string, status: UserStatus): Promise<AuthUser | null> {
    return withDbError(async () => {
      const [row] = await db
        .update(user)
        .set({ status })
        .where(eq(user.id, id))
        .returning()
      return row ? toAuthUser(row) : null
    })
  },
}
