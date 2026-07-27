/**
 * Ensures Stripe Products/Prices exist and syncs `stripe_price_id` + `price_cents`
 * into local `plans`. Re-run after changing a Product's default price in Stripe.
 *
 * Usage:
 *   npm run stripe:sync-plans
 *
 * Note: Stripe Prices are immutable. To change amount, create a new Price,
 * set it as the Product default_price (and move the lookup_key), then sync.
 */
import { config } from "dotenv"
import { and, eq, isNull } from "drizzle-orm"
import Stripe from "stripe"

config({ path: ".env.local" })
config({ path: ".env" })

import { db } from "@/db"
import { plans } from "@/db/schema"
import { PLAN_CATALOG } from "@/modules/billing/constants/catalog"

function requireStripeKey(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY. Add it to .env.local (same account as Stripe CLI).",
    )
  }
  return key
}

async function findOrCreateProduct(
  stripe: Stripe,
  entry: (typeof PLAN_CATALOG)[number],
): Promise<Stripe.Product> {
  const search = await stripe.products.search({
    query: `metadata['sclinic_plan']:'${entry.slug}'`,
    limit: 1,
  })
  if (search.data[0]) return search.data[0]

  return stripe.products.create({
    name: entry.name,
    description: entry.description,
    metadata: {
      sclinic_plan: entry.slug,
      sclinic_app: "sclinic",
    },
  })
}

async function findOrCreatePrice(
  stripe: Stripe,
  productId: string,
  entry: (typeof PLAN_CATALOG)[number],
): Promise<Stripe.Price> {
  const listed = await stripe.prices.list({
    lookup_keys: [entry.lookupKey],
    limit: 1,
  })
  if (listed.data[0]) return listed.data[0]

  return stripe.prices.create({
    product: productId,
    unit_amount: entry.priceCents,
    currency: entry.currency.toLowerCase(),
    recurring: { interval: "month" },
    lookup_key: entry.lookupKey,
    metadata: {
      sclinic_plan: entry.slug,
      sclinic_app: "sclinic",
    },
  })
}

async function upsertLocalPlan(
  entry: (typeof PLAN_CATALOG)[number],
  price: Stripe.Price,
): Promise<void> {
  const priceCents = price.unit_amount
  if (priceCents == null) {
    throw new Error(`Price ${price.id} has no unit_amount`)
  }

  const [existing] = await db
    .select({ id: plans.id, stripePriceId: plans.stripePriceId })
    .from(plans)
    .where(
      and(
        eq(plans.name, entry.name),
        eq(plans.billingCycle, entry.billingCycle),
        isNull(plans.deletedAt),
      ),
    )
    .limit(1)

  const patch = {
    description: entry.description,
    priceCents,
    currency: price.currency.toUpperCase(),
    maxUsers: entry.maxUsers,
    maxProfessionals: entry.maxProfessionals,
    maxStorageBytes: entry.maxStorageBytes,
    stripePriceId: price.id,
    isActive: price.active && true,
  }

  if (existing) {
    await db.update(plans).set(patch).where(eq(plans.id, existing.id))
    console.log(
      `Updated plan ${entry.name}: ${price.id} → ${priceCents} ${price.currency.toUpperCase()}`,
    )
    return
  }

  await db.insert(plans).values({
    name: entry.name,
    billingCycle: entry.billingCycle,
    ...patch,
  })
  console.log(
    `Inserted plan ${entry.name}: ${price.id} → ${priceCents} ${price.currency.toUpperCase()}`,
  )
}

async function sync() {
  const stripe = new Stripe(requireStripeKey(), {
    apiVersion: "2026-06-24.dahlia",
  })

  for (const entry of PLAN_CATALOG) {
    const product = await findOrCreateProduct(stripe, entry)

    // Prefer Product.default_price when active (Dashboard price changes land here).
    const defaultPriceId =
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id

    let catalogPrice: Stripe.Price | null = null
    if (defaultPriceId) {
      const defaultPrice = await stripe.prices.retrieve(defaultPriceId)
      if (defaultPrice.active) {
        catalogPrice = defaultPrice
      }
    }

    if (!catalogPrice) {
      catalogPrice = await findOrCreatePrice(stripe, product.id, entry)
      await stripe.products.update(product.id, {
        default_price: catalogPrice.id,
      })
    }

    await upsertLocalPlan(entry, catalogPrice)
  }

  console.log("Stripe → plans sync completed")
}

sync().catch((error) => {
  console.error(error)
  process.exit(1)
})
