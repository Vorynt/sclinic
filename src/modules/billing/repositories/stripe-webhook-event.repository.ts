import { eq } from "drizzle-orm"

import { db } from "@/db"
import { stripeWebhookEvents } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"

export const stripeWebhookEventRepository = {
  async hasProcessed(stripeEventId: string): Promise<boolean> {
    return withDbError(async () => {
      const [row] = await db
        .select({ id: stripeWebhookEvents.id })
        .from(stripeWebhookEvents)
        .where(eq(stripeWebhookEvents.stripeEventId, stripeEventId))
        .limit(1)

      return Boolean(row)
    })
  },

  async markProcessed(input: {
    stripeEventId: string
    type: string
  }): Promise<void> {
    return withDbError(async () => {
      await db.insert(stripeWebhookEvents).values({
        stripeEventId: input.stripeEventId,
        type: input.type,
      })
    })
  },
}
