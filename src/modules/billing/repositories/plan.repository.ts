import { and, asc, eq, isNull } from "drizzle-orm"

import { db } from "@/db"
import { plans } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toPlan } from "@/modules/billing/mappers/billing.mapper"
import type { Plan } from "@/modules/billing/types/billing"

export const planRepository = {
  async listActive(): Promise<Plan[]> {
    return withDbError(async () => {
      const rows = await db
        .select()
        .from(plans)
        .where(and(eq(plans.isActive, true), isNull(plans.deletedAt)))
        .orderBy(asc(plans.priceCents))

      return rows.map(toPlan)
    })
  },

  async findActiveById(id: string): Promise<Plan | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(plans)
        .where(
          and(
            eq(plans.id, id),
            eq(plans.isActive, true),
            isNull(plans.deletedAt),
          ),
        )
        .limit(1)

      return row ? toPlan(row) : null
    })
  },

  async findByStripePriceId(stripePriceId: string): Promise<Plan | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(plans)
        .where(
          and(
            eq(plans.stripePriceId, stripePriceId),
            isNull(plans.deletedAt),
          ),
        )
        .limit(1)

      return row ? toPlan(row) : null
    })
  },

  async findByNameAndCycle(
    name: string,
    billingCycle: Plan["billingCycle"],
  ): Promise<Plan | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(plans)
        .where(
          and(
            eq(plans.name, name),
            eq(plans.billingCycle, billingCycle),
            isNull(plans.deletedAt),
          ),
        )
        .limit(1)

      return row ? toPlan(row) : null
    })
  },

  async syncFromStripePrice(input: {
    planName: string
    billingCycle: Plan["billingCycle"]
    stripePriceId: string
    priceCents: number
    currency: string
    isActive: boolean
  }): Promise<Plan | null> {
    return withDbError(async () => {
      const [existing] = await db
        .select()
        .from(plans)
        .where(
          and(
            eq(plans.name, input.planName),
            eq(plans.billingCycle, input.billingCycle),
            isNull(plans.deletedAt),
          ),
        )
        .limit(1)

      if (!existing) return null

      const [row] = await db
        .update(plans)
        .set({
          stripePriceId: input.stripePriceId,
          priceCents: input.priceCents,
          currency: input.currency.toUpperCase(),
          isActive: input.isActive,
        })
        .where(eq(plans.id, existing.id))
        .returning()

      return row ? toPlan(row) : null
    })
  },
}
