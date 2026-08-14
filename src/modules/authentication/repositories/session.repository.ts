import { and, desc, eq, gt } from "drizzle-orm"

import { db } from "@/db"
import { session } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import {
  toAuthSession,
  toAuthSessionDevice,
} from "@/modules/authentication/mappers/auth.mapper"
import type {
  AuthSession,
  AuthSessionDevice,
} from "@/modules/authentication/types/auth"

type SessionDeviceRecord = Omit<AuthSessionDevice, "isCurrent">

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

  async listActiveByUserId(userId: string): Promise<SessionDeviceRecord[]> {
    return withDbError(async () => {
      const rows = await db
        .select({
          id: session.id,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
        })
        .from(session)
        .where(
          and(eq(session.userId, userId), gt(session.expiresAt, new Date())),
        )
        .orderBy(desc(session.createdAt))

      return rows.map(toAuthSessionDevice)
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

  async clearActiveClinicIdForClinic(clinicId: string): Promise<void> {
    return withDbError(async () => {
      await db
        .update(session)
        .set({ activeClinicId: null })
        .where(eq(session.activeClinicId, clinicId))
    })
  },
}
