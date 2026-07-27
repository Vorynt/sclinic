import { getStripe } from "@/core/stripe"
import { billingService } from "@/modules/billing/services/billing.service"
import { logger } from "@/core/logger"
import { env } from "@/config/env"

export const runtime = "nodejs"

export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 })
  }

  const payload = await request.text()

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (error) {
    logger.error({ error }, "stripe.webhook.signature_invalid")
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    await billingService.applyStripeWebhookEvent(event)
  } catch (error) {
    logger.error(
      {
        eventId: event.id,
        type: event.type,
        error,
      },
      "stripe.webhook.process_failed",
    )
    return new Response("Webhook handler failed", { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
