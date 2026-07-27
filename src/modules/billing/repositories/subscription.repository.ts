import { and, desc, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import { plans, subscriptions } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { LIVING_SUBSCRIPTION_STATUSES } from "@/modules/billing/constants/subscription"
import { toPlan, toSubscription } from "@/modules/billing/mappers/billing.mapper"
import type {
  Subscription,
  SubscriptionStatus,
  SubscriptionWithPlan,
} from "@/modules/billing/types/billing"

export const subscriptionRepository = {
  async createIncomplete(input: {
    userId: string
    planId: string
  }): Promise<Subscription> {
    return withDbError(async () => {
      const [row] = await db
        .insert(subscriptions)
        .values({
          userId: input.userId,
          planId: input.planId,
          gateway: "stripe",
          status: "incomplete",
          cancelAtPeriodEnd: false,
        })
        .returning()

      if (!row) {
        throw new Error("Failed to create subscription")
      }

      return toSubscription(row)
    })
  },

  async findByUserId(userId: string): Promise<Subscription | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(subscriptions)
        .where(
          and(eq(subscriptions.userId, userId), isNull(subscriptions.deletedAt)),
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1)

      return row ? toSubscription(row) : null
    })
  },

  async findLivingByUserId(userId: string): Promise<Subscription | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, userId),
            isNull(subscriptions.deletedAt),
            inArray(subscriptions.status, [...LIVING_SUBSCRIPTION_STATUSES]),
          ),
        )
        .limit(1)

      return row ? toSubscription(row) : null
    })
  },

  async findWithPlanByUserId(
    userId: string,
  ): Promise<SubscriptionWithPlan | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          subscription: subscriptions,
          plan: plans,
        })
        .from(subscriptions)
        .innerJoin(plans, eq(subscriptions.planId, plans.id))
        .where(
          and(eq(subscriptions.userId, userId), isNull(subscriptions.deletedAt)),
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1)

      if (!row) return null

      return {
        ...toSubscription(row.subscription),
        plan: toPlan(row.plan),
      }
    })
  },

  async findByGatewaySubscriptionId(
    gatewaySubscriptionId: string,
  ): Promise<Subscription | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.gatewaySubscriptionId, gatewaySubscriptionId),
            isNull(subscriptions.deletedAt),
          ),
        )
        .limit(1)

      return row ? toSubscription(row) : null
    })
  },

  async findByGatewayCustomerId(
    gatewayCustomerId: string,
  ): Promise<Subscription | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.gatewayCustomerId, gatewayCustomerId),
            isNull(subscriptions.deletedAt),
          ),
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1)

      return row ? toSubscription(row) : null
    })
  },

  async upsertFromGateway(input: {
    userId: string
    planId: string
    status: SubscriptionStatus
    gatewayCustomerId: string | null
    gatewaySubscriptionId: string | null
    trialEndsAt?: Date | null
    currentPeriodStart?: Date | null
    currentPeriodEnd?: Date | null
    cancelAtPeriodEnd?: boolean
  }): Promise<Subscription> {
    return withDbError(async () => {
      const existing = input.gatewaySubscriptionId
        ? await db
            .select()
            .from(subscriptions)
            .where(
              and(
                eq(
                  subscriptions.gatewaySubscriptionId,
                  input.gatewaySubscriptionId,
                ),
                isNull(subscriptions.deletedAt),
              ),
            )
            .limit(1)
        : []

      const existingByUser =
        existing[0] ??
        (
          await db
            .select()
            .from(subscriptions)
            .where(
              and(
                eq(subscriptions.userId, input.userId),
                isNull(subscriptions.deletedAt),
              ),
            )
            .orderBy(desc(subscriptions.createdAt))
            .limit(1)
        )[0]

      if (existingByUser) {
        const [row] = await db
          .update(subscriptions)
          .set({
            planId: input.planId,
            status: input.status,
            gatewayCustomerId: input.gatewayCustomerId,
            gatewaySubscriptionId: input.gatewaySubscriptionId,
            trialEndsAt: input.trialEndsAt ?? existingByUser.trialEndsAt,
            currentPeriodStart:
              input.currentPeriodStart ?? existingByUser.currentPeriodStart,
            currentPeriodEnd:
              input.currentPeriodEnd ?? existingByUser.currentPeriodEnd,
            cancelAtPeriodEnd:
              input.cancelAtPeriodEnd ?? existingByUser.cancelAtPeriodEnd,
          })
          .where(eq(subscriptions.id, existingByUser.id))
          .returning()

        if (!row) throw new Error("Failed to update subscription")
        return toSubscription(row)
      }

      const [row] = await db
        .insert(subscriptions)
        .values({
          userId: input.userId,
          planId: input.planId,
          gateway: "stripe",
          status: input.status,
          gatewayCustomerId: input.gatewayCustomerId,
          gatewaySubscriptionId: input.gatewaySubscriptionId,
          trialEndsAt: input.trialEndsAt ?? null,
          currentPeriodStart: input.currentPeriodStart ?? null,
          currentPeriodEnd: input.currentPeriodEnd ?? null,
          cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
        })
        .returning()

      if (!row) throw new Error("Failed to create subscription")
      return toSubscription(row)
    })
  },

  async updateStatus(
    id: string,
    patch: {
      status?: SubscriptionStatus
      planId?: string
      gatewayCustomerId?: string | null
      gatewaySubscriptionId?: string | null
      trialEndsAt?: Date | null
      currentPeriodStart?: Date | null
      currentPeriodEnd?: Date | null
      cancelAtPeriodEnd?: boolean
    },
  ): Promise<Subscription> {
    return withDbError(async () => {
      const [row] = await db
        .update(subscriptions)
        .set(patch)
        .where(and(eq(subscriptions.id, id), isNull(subscriptions.deletedAt)))
        .returning()

      if (!row) throw new Error("Failed to update subscription")
      return toSubscription(row)
    })
  },
}
