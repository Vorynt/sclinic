import type Stripe from "stripe";

import { env } from "@/config/env";
import { routes } from "@/config/routes";
import { logger } from "@/core/logger";
import { getStripe, isStripeEnabled } from "@/core/stripe";
import { membershipRepository } from "@/modules/authentication/repositories/membership.repository";
import { planNameFromSlug } from "@/modules/billing/constants/catalog";
import {
  isClinicEntitledStatus,
  isLivingSubscriptionStatus,
} from "@/modules/billing/constants/subscription";
import { planQuotaRepository } from "@/modules/billing/repositories/plan-quota.repository";
import { planRepository } from "@/modules/billing/repositories/plan.repository";
import { stripeWebhookEventRepository } from "@/modules/billing/repositories/stripe-webhook-event.repository";
import { subscriptionRepository } from "@/modules/billing/repositories/subscription.repository";
import type {
  Plan,
  Subscription,
  SubscriptionStatus,
  SubscriptionWithPlan,
} from "@/modules/billing/types/billing";
import {
  buildClinicPlanQuota,
  type ClinicPlanQuota,
  type PlanQuotaDimension,
} from "@/modules/billing/utils/plan-quota";
import { clinicRepository } from "@/modules/clinics/repositories/clinic.repository";
import type { ClinicSubscriptionStatus } from "@/modules/clinics/types/clinic";
import { AppError, ErrorCode } from "@/shared/errors";

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    case "incomplete":
    case "incomplete_expired":
    case "paused":
    default:
      return "incomplete";
  }
}

function toClinicSubscriptionStatus(
  status: SubscriptionStatus,
): ClinicSubscriptionStatus {
  switch (status) {
    case "trialing":
    case "active":
    case "past_due":
    case "canceled":
    case "unpaid":
    case "incomplete":
      return status;
    default:
      return "incomplete";
  }
}

function subscriptionPeriod(sub: Stripe.Subscription): {
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
} {
  const item = sub.items.data[0];
  const start = item?.current_period_start ?? null;
  const end = item?.current_period_end ?? null;
  return {
    currentPeriodStart: start ? new Date(start * 1000) : null,
    currentPeriodEnd: end ? new Date(end * 1000) : null,
  };
}

async function syncOwnedClinicsStatus(
  userId: string,
  status: SubscriptionStatus,
): Promise<void> {
  const owned = await membershipRepository.listOwnerByUser(userId);
  const clinicStatus = toClinicSubscriptionStatus(status);
  await Promise.all(
    owned.map((m) =>
      clinicRepository.updateSubscriptionStatus(m.clinicId, clinicStatus),
    ),
  );
}

export const billingService = {
  async listActivePlans(): Promise<Plan[]> {
    return planRepository.listActive();
  },

  async getActivePlan(planId: string): Promise<Plan> {
    const plan = await planRepository.findActiveById(planId);
    if (!plan) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Plano não encontrado ou inativo.",
      });
    }
    return plan;
  },

  async getSubscriptionForUser(
    userId: string,
  ): Promise<SubscriptionWithPlan | null> {
    return subscriptionRepository.findWithPlanByUserId(userId);
  },

  async hasLivingSubscription(userId: string): Promise<boolean> {
    const living = await subscriptionRepository.findLivingByUserId(userId);
    return living !== null;
  },

  /**
   * Whether the clinic's denormalized SaaS status entitles app access (ADR-003).
   */
  async isClinicEntitled(clinicId: string): Promise<boolean> {
    const gate = await this.getClinicEntitlement(clinicId);
    return gate?.entitled ?? false;
  },

  async getClinicEntitlement(
    clinicId: string,
  ): Promise<{ entitled: boolean; name: string } | null> {
    const clinic = await clinicRepository.findById(clinicId);
    if (!clinic) return null;
    return {
      entitled: isClinicEntitledStatus(clinic.subscriptionStatus),
      name: clinic.name,
    };
  },

  async assertClinicEntitled(clinicId: string): Promise<void> {
    const gate = await this.getClinicEntitlement(clinicId);
    if (!gate) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Clínica não encontrada.",
      });
    }
    if (!gate.entitled) {
      throw new AppError(ErrorCode.SUBSCRIPTION_INACTIVE);
    }
  },

  /**
   * Plan limits vs clinic usage (ADR-004). Does not gate app access — only creates.
   */
  async getClinicPlanQuota(clinicId: string): Promise<ClinicPlanQuota> {
    const ownerUserId =
      await membershipRepository.findActiveOwnerUserIdByClinic(clinicId);
    const living = ownerUserId
      ? await subscriptionRepository.findWithPlanByUserId(ownerUserId)
      : null;
    const plan =
      living && isLivingSubscriptionStatus(living.status) ? living.plan : null;
    const usage = await planQuotaRepository.getUsageByClinic(clinicId);

    return buildClinicPlanQuota({
      clinicId,
      planId: plan?.id ?? null,
      planName: plan?.name ?? null,
      limits: {
        maxUsers: plan?.maxUsers ?? null,
        maxProfessionals: plan?.maxProfessionals ?? null,
        maxStorageBytes: plan?.maxStorageBytes ?? null,
      },
      usage,
    });
  },

  /**
   * Blocks create paths that would increase a dimension already at capacity (ADR-004).
   * Call from invitation / professional / upload services — not from requireClinic.
   */
  async assertPlanCapacity(
    clinicId: string,
    dimension: PlanQuotaDimension,
  ): Promise<void> {
    const quota = await this.getClinicPlanQuota(clinicId);
    if (!quota.atCapacity[dimension]) return;

    const labels: Record<PlanQuotaDimension, string> = {
      users: "usuários",
      professionals: "profissionais",
      storage: "armazenamento",
    };

    throw new AppError(ErrorCode.PLAN_LIMIT_EXCEEDED, {
      message: `Limite de ${labels[dimension]} do plano atingido. Atualize o plano ou reduza o uso.`,
      meta: { clinicId, dimension, quota },
    });
  },

  /**
   * Ensures the user has a local subscription row for `planId`.
   * Reuses a living Stripe-backed sub (post-Checkout); otherwise creates/updates incomplete.
   */
  async attachPlanToUser(
    userId: string,
    planId: string,
  ): Promise<Subscription> {
    await this.getActivePlan(planId);

    const living = await subscriptionRepository.findLivingByUserId(userId);
    if (living) {
      return living;
    }

    const existing = await subscriptionRepository.findByUserId(userId);
    if (existing && existing.status === "incomplete") {
      return subscriptionRepository.updateStatus(existing.id, { planId });
    }

    return subscriptionRepository.createIncomplete({ userId, planId });
  },

  async createCheckoutSession(input: {
    userId: string;
    email: string;
    name: string;
    planId: string;
    successPath?: string;
    cancelPath?: string;
  }): Promise<{ url: string }> {
    if (!isStripeEnabled()) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        message: "Stripe não está configurado neste ambiente.",
      });
    }

    const plan = await this.getActivePlan(input.planId);
    if (!plan.stripePriceId) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "Este plano ainda não está vinculado a um preço no Stripe.",
      });
    }

    const living = await subscriptionRepository.findLivingByUserId(
      input.userId,
    );
    if (living) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Você já possui uma assinatura ativa.",
      });
    }

    const stripe = getStripe();
    let customerId =
      (await subscriptionRepository.findByUserId(input.userId))
        ?.gatewayCustomerId ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: input.email,
        name: input.name,
        metadata: { userId: input.userId },
      });
      customerId = customer.id;
      await this.attachPlanToUser(input.userId, input.planId);
      const local = await subscriptionRepository.findByUserId(input.userId);
      if (local) {
        await subscriptionRepository.updateStatus(local.id, {
          gatewayCustomerId: customerId,
        });
      }
    } else {
      await this.attachPlanToUser(input.userId, input.planId);
    }

    const baseUrl = env.BETTER_AUTH_URL.replace(/\/$/, "");
    const successPath =
      input.successPath ??
      `${routes.onboardingClinic}?planId=${encodeURIComponent(input.planId)}&checkout=success`;
    const cancelPath = input.cancelPath ?? routes.onboardingPlan;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: input.userId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      metadata: {
        userId: input.userId,
        planId: input.planId,
      },
      subscription_data: {
        metadata: {
          userId: input.userId,
          planId: input.planId,
        },
      },
    });

    if (!session.url) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        message: "Não foi possível iniciar o checkout.",
      });
    }

    return { url: session.url };
  },

  async createBillingPortalSession(input: {
    userId: string;
  }): Promise<{ url: string }> {
    if (!isStripeEnabled()) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        message: "Stripe não está configurado neste ambiente.",
      });
    }

    const subscription = await subscriptionRepository.findByUserId(
      input.userId,
    );
    if (!subscription?.gatewayCustomerId) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Nenhuma assinatura Stripe encontrada para sua conta.",
      });
    }

    const stripe = getStripe();
    const baseUrl = env.BETTER_AUTH_URL.replace(/\/$/, "");
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.gatewayCustomerId,
      return_url: `${baseUrl}${routes.accountSubscription}`,
    });

    return { url: session.url };
  },

  async applyStripeWebhookEvent(event: Stripe.Event): Promise<void> {
    if (await stripeWebhookEventRepository.hasProcessed(event.id)) {
      return;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const userId =
          session.metadata?.userId ?? session.client_reference_id ?? null;
        const planId = session.metadata?.planId ?? null;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (!userId || !planId || !subscriptionId) break;

        const stripe = getStripe();
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        const period = subscriptionPeriod(stripeSub);
        const status = mapStripeStatus(stripeSub.status);

        await subscriptionRepository.upsertFromGateway({
          userId,
          planId,
          status,
          gatewayCustomerId: customerId ?? null,
          gatewaySubscriptionId: subscriptionId,
          trialEndsAt: stripeSub.trial_end
            ? new Date(stripeSub.trial_end * 1000)
            : null,
          currentPeriodStart: period.currentPeriodStart,
          currentPeriodEnd: period.currentPeriodEnd,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        });
        await syncOwnedClinicsStatus(userId, status);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        await this.syncFromStripeSubscription(stripeSub);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subscriptionId =
          typeof subRef === "string" ? subRef : (subRef?.id ?? null);

        if (!subscriptionId) break;
        const stripe = getStripe();
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        await this.syncFromStripeSubscription(stripeSub);
        break;
      }
      case "product.updated": {
        const product = event.data.object as Stripe.Product;
        await this.syncPlanCatalogFromStripeProduct(product);
        break;
      }
      case "price.created":
      case "price.updated": {
        const price = event.data.object as Stripe.Price;
        await this.syncPlanCatalogFromStripePrice(price);
        break;
      }
      default:
        break;
    }

    await stripeWebhookEventRepository.markProcessed({
      stripeEventId: event.id,
      type: event.type,
    });
  },

  /**
   * Mirrors Product.default_price → local plans (amount + stripePriceId).
   * Triggered when the Dashboard changes the product's default price.
   */
  async syncPlanCatalogFromStripeProduct(
    product: Stripe.Product,
  ): Promise<void> {
    const slug = product.metadata?.sclinic_plan;
    if (!slug) return;

    const planName = planNameFromSlug(slug);
    if (!planName) return;

    const defaultPriceId =
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id;
    if (!defaultPriceId) return;

    const stripe = getStripe();
    const price = await stripe.prices.retrieve(defaultPriceId);
    await this.syncPlanCatalogFromStripePrice(price, planName);
  },

  /**
   * Updates local plan priceCents / stripePriceId from a Stripe Price.
   * Amounts on Price objects are immutable — a new Price + new default_price
   * is how Dashboard "price changes" land here.
   */
  async syncPlanCatalogFromStripePrice(
    price: Stripe.Price,
    planNameHint?: string,
  ): Promise<void> {
    if (price.type !== "recurring" || price.recurring?.interval !== "month") {
      return;
    }
    if (price.unit_amount == null) return;

    const slug = price.metadata?.sclinic_plan;
    const planName = planNameHint ?? (slug ? planNameFromSlug(slug) : null);

    let resolvedName = planName;
    if (!resolvedName) {
      const existing = await planRepository.findByStripePriceId(price.id);
      resolvedName = existing?.name ?? null;
    }
    if (!resolvedName) return;

    await planRepository.syncFromStripePrice({
      planName: resolvedName,
      billingCycle: "monthly",
      stripePriceId: price.id,
      priceCents: price.unit_amount,
      currency: price.currency,
      isActive: price.active,
    });
  },

  async syncFromStripeSubscription(
    stripeSub: Stripe.Subscription,
  ): Promise<void> {
    const metadataUserId = stripeSub.metadata?.userId ?? null;
    let metadataPlanId: string | null = stripeSub.metadata?.planId ?? null;
    const priceId = stripeSub.items.data[0]?.price.id;

    if (!metadataPlanId && priceId) {
      const plan = await planRepository.findByStripePriceId(priceId);
      metadataPlanId = plan?.id ?? null;
    }

    const existing = await subscriptionRepository.findByGatewaySubscriptionId(
      stripeSub.id,
    );
    const resolvedUserId = metadataUserId ?? existing?.userId ?? null;
    const resolvedPlanId = metadataPlanId ?? existing?.planId ?? null;

    if (!resolvedUserId || !resolvedPlanId) {
      return;
    }

    const period = subscriptionPeriod(stripeSub);
    const status = mapStripeStatus(stripeSub.status);
    const customerId =
      typeof stripeSub.customer === "string"
        ? stripeSub.customer
        : stripeSub.customer.id;

    await subscriptionRepository.upsertFromGateway({
      userId: resolvedUserId,
      planId: resolvedPlanId,
      status,
      gatewayCustomerId: customerId,
      gatewaySubscriptionId: stripeSub.id,
      trialEndsAt: stripeSub.trial_end
        ? new Date(stripeSub.trial_end * 1000)
        : null,
      currentPeriodStart: period.currentPeriodStart,
      currentPeriodEnd: period.currentPeriodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    });
    await syncOwnedClinicsStatus(resolvedUserId, status);

    if (stripeSub.cancel_at_period_end || status === "canceled") {
      logger.info(
        {
          userId: resolvedUserId,
          stripeSubscriptionId: stripeSub.id,
          status,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          currentPeriodEnd: period.currentPeriodEnd?.toISOString() ?? null,
        },
        "stripe.subscription.cancel_synced",
      );
    }
  },
};
