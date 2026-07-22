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
}
