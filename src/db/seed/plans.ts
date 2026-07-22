/**
 * Seeds stub SaaS plans (Stripe price IDs filled later).
 *
 * Usage:
 *   npm run db:seed:plans
 */
import { config } from "dotenv"
import { and, eq, isNull } from "drizzle-orm"

config({ path: ".env.local" })
config({ path: ".env" })

import { db } from "@/db"
import { plans } from "@/db/schema"

const STUB_PLANS = [
  {
    name: "Essencial",
    description: "Para clínicas começando a digitalizar o atendimento.",
    priceCents: 9900,
    currency: "BRL",
    billingCycle: "monthly" as const,
    maxUsers: 3,
    maxProfessionals: 2,
    // PG integer max ~2GB — store bytes within int4 until schema migrates to bigint
    maxStorageBytes: 1 * 1024 * 1024 * 1024,
    stripePriceId: null,
    isActive: true,
  },
  {
    name: "Profissional",
    description: "Operação completa com mais usuários e profissionais.",
    priceCents: 19900,
    currency: "BRL",
    billingCycle: "monthly" as const,
    maxUsers: 10,
    maxProfessionals: 8,
    maxStorageBytes: 2 * 1024 * 1024 * 1024 - 1,
    stripePriceId: null,
    isActive: true,
  },
  {
    name: "Enterprise",
    description: "Limites ampliados para redes e alto volume.",
    priceCents: 39900,
    currency: "BRL",
    billingCycle: "monthly" as const,
    maxUsers: 50,
    maxProfessionals: 40,
    maxStorageBytes: 2 * 1024 * 1024 * 1024 - 1,
    stripePriceId: null,
    isActive: true,
  },
]

async function seed() {
  for (const plan of STUB_PLANS) {
    const [existing] = await db
      .select({ id: plans.id })
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
      await db
        .update(plans)
        .set({
          description: plan.description,
          priceCents: plan.priceCents,
          currency: plan.currency,
          maxUsers: plan.maxUsers,
          maxProfessionals: plan.maxProfessionals,
          maxStorageBytes: plan.maxStorageBytes,
          isActive: plan.isActive,
        })
        .where(eq(plans.id, existing.id))
      continue
    }

    await db.insert(plans).values(plan)
  }

  console.log("Plans seed completed")
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
