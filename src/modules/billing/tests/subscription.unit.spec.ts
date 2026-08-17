import { describe, expect, it } from "@jest/globals"

import type { Subscription as SubscriptionRow } from "@/db/schema"
import {
  PLAN_CATALOG,
  planNameFromSlug,
  planSlugFromName,
} from "@/modules/billing/constants/catalog"
import {
  isClinicEntitledStatus,
  isLivingSubscriptionStatus,
  LIVING_SUBSCRIPTION_STATUSES,
  shouldOfferSubscriptionTrial,
  shouldOpenBillingPortalForRegularize,
  SUBSCRIPTION_TRIAL_DAYS,
} from "@/modules/billing/constants/subscription"
import { toSubscription } from "@/modules/billing/mappers/billing.mapper"
import { createCheckoutSessionSchema } from "@/modules/billing/schemas/checkout.schema"
import { createRegularizeSessionSchema } from "@/modules/billing/schemas/regularize.schema"
import { formatStorageBytes } from "@/modules/billing/utils/format-storage"
import { buildClinicPlanQuota } from "@/modules/billing/utils/plan-quota"
import { resolveSubscriptionPlanId } from "@/modules/billing/utils/resolve-subscription-plan-id"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("PLAN_CATALOG", () => {
  it("has three monthly plans with Stripe lookup keys", () => {
    expect(PLAN_CATALOG.length).toBe(3)
    for (const plan of PLAN_CATALOG) {
      expect(plan.lookupKey).toMatch(/^sclinic_.+_monthly$/)
      expect(plan.currency).toBe("BRL")
      expect(plan.billingCycle).toBe("monthly")
    }
  })

  it("maps slug ↔ name", () => {
    expect(planNameFromSlug("profissional")).toBe("Profissional")
    expect(planSlugFromName("Essencial")).toBe("essencial")
    expect(planNameFromSlug("unknown")).toBe(null)
  })
})

describe("isLivingSubscriptionStatus", () => {
  it("includes trialing, active and past_due", () => {
    expect([...LIVING_SUBSCRIPTION_STATUSES]).toEqual([
      "trialing",
      "active",
      "past_due",
    ])
    expect(isLivingSubscriptionStatus("trialing")).toBe(true)
    expect(isLivingSubscriptionStatus("active")).toBe(true)
    expect(isLivingSubscriptionStatus("past_due")).toBe(true)
  })

  it("excludes incomplete, canceled and unpaid", () => {
    expect(isLivingSubscriptionStatus("incomplete")).toBe(false)
    expect(isLivingSubscriptionStatus("canceled")).toBe(false)
    expect(isLivingSubscriptionStatus("unpaid")).toBe(false)
  })
})

describe("isClinicEntitledStatus", () => {
  it("matches living subscription statuses", () => {
    expect(isClinicEntitledStatus("trialing")).toBe(true)
    expect(isClinicEntitledStatus("active")).toBe(true)
    expect(isClinicEntitledStatus("past_due")).toBe(true)
  })

  it("blocks none, incomplete, canceled and unpaid", () => {
    expect(isClinicEntitledStatus("none")).toBe(false)
    expect(isClinicEntitledStatus("incomplete")).toBe(false)
    expect(isClinicEntitledStatus("canceled")).toBe(false)
    expect(isClinicEntitledStatus("unpaid")).toBe(false)
  })
})

describe("shouldOpenBillingPortalForRegularize", () => {
  it("opens Portal for unpaid and incomplete", () => {
    expect(shouldOpenBillingPortalForRegularize("unpaid")).toBe(true)
    expect(shouldOpenBillingPortalForRegularize("incomplete")).toBe(true)
  })

  it("does not open Portal for canceled — that path is Checkout", () => {
    expect(shouldOpenBillingPortalForRegularize("canceled")).toBe(false)
  })

  it("does not open Portal for living statuses", () => {
    expect(shouldOpenBillingPortalForRegularize("trialing")).toBe(false)
    expect(shouldOpenBillingPortalForRegularize("active")).toBe(false)
    expect(shouldOpenBillingPortalForRegularize("past_due")).toBe(false)
  })
})

describe("subscription trial", () => {
  it("uses a 7-day trial window", () => {
    expect(SUBSCRIPTION_TRIAL_DAYS).toBe(7)
  })

  it("offers trial only when there was no prior gateway subscription", () => {
    expect(shouldOfferSubscriptionTrial(null)).toBe(true)
    expect(shouldOfferSubscriptionTrial({ gatewaySubscriptionId: null })).toBe(true)
    expect(shouldOfferSubscriptionTrial({
        gatewaySubscriptionId: "sub_prior",
      })).toBe(false)
  })
})

describe("createCheckoutSessionSchema", () => {
  it("accepts planId uuid", () => {
    const parsed = createCheckoutSessionSchema.parse({
      planId: VALID_UUID,
    })
    expect(parsed.planId).toBe(VALID_UUID)
  })

  it("rejects invalid planId", () => {
    const result = createCheckoutSessionSchema.safeParse({ planId: "x" })
    expect(result.success).toBe(false)
  })
})

describe("createRegularizeSessionSchema", () => {
  it("accepts empty object for Portal-first", () => {
    const parsed = createRegularizeSessionSchema.parse({})
    expect(parsed.planId).toBe(undefined)
  })

  it("accepts optional planId uuid", () => {
    const parsed = createRegularizeSessionSchema.parse({
      planId: VALID_UUID,
    })
    expect(parsed.planId).toBe(VALID_UUID)
  })
})

describe("toSubscription", () => {
  it("maps userId and period fields", () => {
    const now = new Date("2026-07-01T00:00:00.000Z")
    const end = new Date("2026-08-01T00:00:00.000Z")
    const row = {
      id: VALID_UUID,
      userId: "user_1",
      planId: VALID_UUID,
      gateway: "stripe",
      gatewayCustomerId: "cus_1",
      gatewaySubscriptionId: "sub_1",
      status: "active",
      trialEndsAt: null,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    } as SubscriptionRow

    const mapped = toSubscription(row)
    expect(mapped.userId).toBe("user_1")
    expect(mapped.status).toBe("active")
    expect(mapped.currentPeriodStart?.toISOString()).toBe(now.toISOString())
    expect(mapped.cancelAtPeriodEnd).toBe(false)
  })
})

describe("buildClinicPlanQuota", () => {
  it("flags over_limit when usage exceeds limits", () => {
    const quota = buildClinicPlanQuota({
      clinicId: VALID_UUID,
      planId: VALID_UUID,
      planName: "Essencial",
      limits: {
        maxUsers: 3,
        maxProfessionals: 2,
        maxStorageBytes: 1000,
      },
      usage: { users: 5, professionals: 1, storageBytes: 100 },
    })

    expect(quota.isOverLimit).toBe(true)
    expect(quota.over.users).toBe(true)
    expect(quota.over.professionals).toBe(false)
    expect(quota.atCapacity.users).toBe(true)
    expect(quota.atCapacity.professionals).toBe(false)
  })

  it("treats usage equal to limit as atCapacity but not over", () => {
    const quota = buildClinicPlanQuota({
      clinicId: VALID_UUID,
      planId: VALID_UUID,
      planName: "Essencial",
      limits: {
        maxUsers: 3,
        maxProfessionals: 2,
        maxStorageBytes: null,
      },
      usage: { users: 3, professionals: 2, storageBytes: 0 },
    })

    expect(quota.isOverLimit).toBe(false)
    expect(quota.atCapacity.users).toBe(true)
    expect(quota.atCapacity.professionals).toBe(true)
    expect(quota.atCapacity.storage).toBe(false)
  })

  it("treats null limits as unlimited", () => {
    const quota = buildClinicPlanQuota({
      clinicId: VALID_UUID,
      planId: null,
      planName: null,
      limits: {
        maxUsers: null,
        maxProfessionals: null,
        maxStorageBytes: null,
      },
      usage: { users: 100, professionals: 50, storageBytes: 9e12 },
    })

    expect(quota.isOverLimit).toBe(false)
    expect(quota.atCapacity.users).toBe(false)
  })
})

describe("formatStorageBytes", () => {
  it("formats bytes, KB, MB and GB", () => {
    expect(formatStorageBytes(0)).toBe("0 B")
    expect(formatStorageBytes(512)).toBe("512 B")
    expect(formatStorageBytes(1024)).toBe("1 KB")
    expect(formatStorageBytes(1536)).toBe("1,5 KB")
    expect(formatStorageBytes(1024 * 1024)).toBe("1 MB")
    expect(formatStorageBytes(1024 * 1024 * 1024)).toBe("1 GB")
  })
})

describe("resolveSubscriptionPlanId", () => {
  const planA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
  const planB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

  it("prefers the plan mapped from the current Stripe price", () => {
    expect(resolveSubscriptionPlanId({
        planIdFromPrice: planB,
        metadataPlanId: planA,
        existingPlanId: planA,
      })).toBe(planB)
  })

  it("falls back to metadata when price has no local plan", () => {
    expect(resolveSubscriptionPlanId({
        planIdFromPrice: null,
        metadataPlanId: planA,
        existingPlanId: planB,
      })).toBe(planA)
  })

  it("falls back to the existing local plan last", () => {
    expect(resolveSubscriptionPlanId({
        planIdFromPrice: null,
        metadataPlanId: null,
        existingPlanId: planA,
      })).toBe(planA)
  })

  it("returns null when nothing can be resolved", () => {
    expect(resolveSubscriptionPlanId({
        planIdFromPrice: null,
        metadataPlanId: null,
        existingPlanId: null,
      })).toBe(null)
  })
})
