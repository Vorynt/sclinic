import Stripe from "stripe"

import { env } from "@/config/env"

let stripeClient: Stripe | null = null

/**
 * Lazy Stripe client (server-only). Throws if STRIPE_SECRET_KEY is missing.
 */
export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    })
  }
  return stripeClient
}

export function isStripeEnabled(): boolean {
  return env.isStripeConfigured
}
