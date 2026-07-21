import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { userStatusEnum } from "./enums"
import { primaryTextId, timestamps } from "./helpers"

/**
 * Better Auth core tables (singular names — BA default).
 * Configure adapter with schema mapping or modelName if you rename.
 *
 * Domain extensions on `user`: phone, status, lastLoginAt.
 * Password lives on `account.password` (credential provider), not on user.
 */
export const user = pgTable("user", {
  id: primaryTextId(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  phone: text("phone"),
  status: userStatusEnum("status").default("active").notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
})

export const session = pgTable(
  "session",
  {
    id: primaryTextId(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    ...timestamps,
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Active clinic for switcher — app-managed session field. */
    activeClinicId: text("active_clinic_id"),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
)

export const account = pgTable(
  "account",
  {
    id: primaryTextId(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
)

export const verification = pgTable(
  "verification",
  {
    id: primaryTextId(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    ...timestamps,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert
