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

import { clinics } from "./clinics"
import {
  billingCycleEnum,
  subscriptionStatusEnum,
} from "./enums"
import {
  clinicIsolation,
  primaryUuid,
  softDelete,
  timestamps,
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

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
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
    uniqueIndex("subscriptions_clinic_active_uidx")
      .on(t.clinicId)
      .where(
        sql`${t.deletedAt} IS NULL AND ${t.status} IN ('trialing', 'active', 'past_due')`,
      ),
    uniqueIndex("subscriptions_gateway_subscription_uidx")
      .on(t.gatewaySubscriptionId)
      .where(sql`${t.gatewaySubscriptionId} IS NOT NULL`),
    index("subscriptions_clinic_id_idx").on(t.clinicId),
    index("subscriptions_plan_id_idx").on(t.planId),
    pgPolicy("subscriptions_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type Plan = typeof plans.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
