import { db } from "@/db"
import { subscriptions } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toSubscription } from "@/modules/billing/mappers/billing.mapper"
import type { Subscription } from "@/modules/billing/types/billing"

export const subscriptionRepository = {
  async createIncomplete(input: {
    clinicId: string
    planId: string
  }): Promise<Subscription> {
    return withDbError(async () => {
      const [row] = await db
        .insert(subscriptions)
        .values({
          clinicId: input.clinicId,
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
}
