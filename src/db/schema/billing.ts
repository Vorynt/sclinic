import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { user } from "./auth"
import {
  billingCycleEnum,
  subscriptionStatusEnum,
} from "./enums"
import {
  primaryUuid,
  softDelete,
  timestamps,
  tenantUserId,
} from "./helpers"
import { sclinicAppRole } from "./rls"

/** Global SaaS catalog (no clinic_id). */
export const plans = pgTable(
  "plans",
  {
    id: primaryUuid(),
    name: text("name").notNull(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").default("BRL").notNull(),
    billingCycle: billingCycleEnum("billing_cycle").default("monthly").notNull(),
    maxUsers: integer("max_users"),
    maxProfessionals: integer("max_professionals"),
    maxStorageBytes: integer("max_storage_bytes"),
    stripePriceId: text("stripe_price_id"),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("plans_stripe_price_id_uidx")
      .on(t.stripePriceId)
      .where(sql`${t.stripePriceId} IS NOT NULL`),
    index("plans_is_active_idx").on(t.isActive),
  ],
)

/**
 * SaaS subscription — payer is the user (ADR-003).
 * Entitles at most one owned clinic in the MVP (1:1).
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: primaryUuid(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    gateway: text("gateway").default("stripe").notNull(),
    gatewayCustomerId: text("gateway_customer_id"),
    gatewaySubscriptionId: text("gateway_subscription_id"),
    status: subscriptionStatusEnum("status").default("incomplete").notNull(),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true, mode: "date" }),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
      mode: "date",
    }),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
      mode: "date",
    }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("subscriptions_user_active_uidx")
      .on(t.userId)
      .where(
        sql`${t.deletedAt} IS NULL AND ${t.status} IN ('trialing', 'active', 'past_due')`,
      ),
    uniqueIndex("subscriptions_gateway_subscription_uidx")
      .on(t.gatewaySubscriptionId)
      .where(sql`${t.gatewaySubscriptionId} IS NOT NULL`),
    uniqueIndex("subscriptions_gateway_customer_uidx")
      .on(t.gatewayCustomerId)
      .where(sql`${t.gatewayCustomerId} IS NOT NULL`),
    index("subscriptions_user_id_idx").on(t.userId),
    index("subscriptions_plan_id_idx").on(t.planId),
    pgPolicy("subscriptions_owner_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: sql`${t.userId} = ${tenantUserId()}`,
      withCheck: sql`${t.userId} = ${tenantUserId()}`,
    }),
    /**
     * Onboarding / webhook bootstrap before session GUCs are reliable (Neon HTTP).
     * Permissive OR with owner isolation above.
     */
    pgPolicy("subscriptions_insert_onboarding", {
      as: "permissive",
      to: sclinicAppRole,
      for: "insert",
      withCheck: sql`true`,
    }),
  ],
)

/**
 * Stripe webhook idempotency (no tenant — processed by system).
 */
export const stripeWebhookEvents = pgTable(
  "stripe_webhook_events",
  {
    id: primaryUuid(),
    stripeEventId: text("stripe_event_id").notNull(),
    type: text("type").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("stripe_webhook_events_stripe_event_id_uidx").on(
      t.stripeEventId,
    ),
    index("stripe_webhook_events_type_idx").on(t.type),
  ],
)

export type Plan = typeof plans.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect
