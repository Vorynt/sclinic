import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"

import { db } from "@/db"
import { account, user } from "@/db/schema"
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

  /**
   * Creates a credential user without opening a session (invite provisioning).
   * Password must already be hashed with Better Auth's hasher.
   */
  async createWithCredential(params: {
    name: string
    email: string
    passwordHash: string
  }): Promise<AuthUser> {
    return withDbError(async () => {
      const id = randomUUID()
      const email = params.email.toLowerCase()

      const [row] = await db
        .insert(user)
        .values({
          id,
          name: params.name,
          email,
          emailVerified: false,
          status: "active",
          mustChangePassword: true,
        })
        .returning()

      if (!row) {
        throw new Error("Failed to create user")
      }

      await db.insert(account).values({
        id: randomUUID(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password: params.passwordHash,
      })

      return toAuthUser(row)
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

  async setMustChangePassword(
    id: string,
    mustChangePassword: boolean,
  ): Promise<void> {
    return withDbError(async () => {
      await db
        .update(user)
        .set({ mustChangePassword })
        .where(eq(user.id, id))
    })
  },
}
