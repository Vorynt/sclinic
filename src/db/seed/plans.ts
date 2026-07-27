/**
 * Seeds stub SaaS plans (Stripe IDs filled by `npm run stripe:sync-plans`).
 *
 * Usage:
 *   npm run db:seed:plans
 *
 * Does not overwrite `stripePriceId` / `priceCents` when the plan is already
 * linked to Stripe — Stripe is the source of truth for amounts after sync.
 */
import { config } from "dotenv"
import { and, eq, isNull } from "drizzle-orm"

config({ path: ".env.local" })
config({ path: ".env" })

import { db } from "@/db"
import { plans } from "@/db/schema"
import { PLAN_CATALOG } from "@/modules/billing/constants/catalog"

async function seed() {
  for (const plan of PLAN_CATALOG) {
    const [existing] = await db
      .select({
        id: plans.id,
        stripePriceId: plans.stripePriceId,
      })
      .from(plans)
      .where(
        and(
          eq(plans.name, plan.name),
          eq(plans.billingCycle, plan.billingCycle),
          isNull(plans.deletedAt),
        ),
      )
      .limit(1)

    if (existing) {
      const linkedToStripe = Boolean(existing.stripePriceId)
      await db
        .update(plans)
        .set({
          description: plan.description,
          ...(linkedToStripe
            ? {}
            : {
                priceCents: plan.priceCents,
                currency: plan.currency,
              }),
          maxUsers: plan.maxUsers,
          maxProfessionals: plan.maxProfessionals,
          maxStorageBytes: plan.maxStorageBytes,
          isActive: true,
        })
        .where(eq(plans.id, existing.id))
      continue
    }

    await db.insert(plans).values({
      name: plan.name,
      description: plan.description,
      priceCents: plan.priceCents,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      maxUsers: plan.maxUsers,
      maxProfessionals: plan.maxProfessionals,
      maxStorageBytes: plan.maxStorageBytes,
      stripePriceId: null,
      isActive: true,
    })
  }

  console.log("Plans seed completed")
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
