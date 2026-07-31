import assert from "node:assert/strict"
import { describe, it } from "node:test"

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
} from "@/modules/billing/constants/subscription"
import { toSubscription } from "@/modules/billing/mappers/billing.mapper"
import { createCheckoutSessionSchema } from "@/modules/billing/schemas/checkout.schema"
import { createRegularizeSessionSchema } from "@/modules/billing/schemas/regularize.schema"
import { buildClinicPlanQuota } from "@/modules/billing/utils/plan-quota"
import { formatStorageBytes } from "@/modules/billing/utils/format-storage"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("PLAN_CATALOG", () => {
  it("has three monthly plans with Stripe lookup keys", () => {
    assert.equal(PLAN_CATALOG.length, 3)
    for (const plan of PLAN_CATALOG) {
      assert.match(plan.lookupKey, /^sclinic_.+_monthly$/)
      assert.equal(plan.currency, "BRL")
      assert.equal(plan.billingCycle, "monthly")
    }
  })

  it("maps slug ↔ name", () => {
    assert.equal(planNameFromSlug("profissional"), "Profissional")
    assert.equal(planSlugFromName("Essencial"), "essencial")
    assert.equal(planNameFromSlug("unknown"), null)
  })
})

describe("isLivingSubscriptionStatus", () => {
  it("includes trialing, active and past_due", () => {
    assert.deepEqual([...LIVING_SUBSCRIPTION_STATUSES], [
      "trialing",
      "active",
      "past_due",
    ])
    assert.equal(isLivingSubscriptionStatus("trialing"), true)
    assert.equal(isLivingSubscriptionStatus("active"), true)
    assert.equal(isLivingSubscriptionStatus("past_due"), true)
  })

  it("excludes incomplete, canceled and unpaid", () => {
    assert.equal(isLivingSubscriptionStatus("incomplete"), false)
    assert.equal(isLivingSubscriptionStatus("canceled"), false)
    assert.equal(isLivingSubscriptionStatus("unpaid"), false)
  })
})

describe("isClinicEntitledStatus", () => {
  it("matches living subscription statuses", () => {
    assert.equal(isClinicEntitledStatus("trialing"), true)
    assert.equal(isClinicEntitledStatus("active"), true)
    assert.equal(isClinicEntitledStatus("past_due"), true)
  })

  it("blocks none, incomplete, canceled and unpaid", () => {
    assert.equal(isClinicEntitledStatus("none"), false)
    assert.equal(isClinicEntitledStatus("incomplete"), false)
    assert.equal(isClinicEntitledStatus("canceled"), false)
    assert.equal(isClinicEntitledStatus("unpaid"), false)
  })
})

describe("createCheckoutSessionSchema", () => {
  it("accepts planId uuid", () => {
    const parsed = createCheckoutSessionSchema.parse({
      planId: VALID_UUID,
    })
    assert.equal(parsed.planId, VALID_UUID)
  })

  it("rejects invalid planId", () => {
    const result = createCheckoutSessionSchema.safeParse({ planId: "x" })
    assert.equal(result.success, false)
  })
})

describe("createRegularizeSessionSchema", () => {
  it("accepts empty object for Portal-first", () => {
    const parsed = createRegularizeSessionSchema.parse({})
    assert.equal(parsed.planId, undefined)
  })

  it("accepts optional planId uuid", () => {
    const parsed = createRegularizeSessionSchema.parse({
      planId: VALID_UUID,
    })
    assert.equal(parsed.planId, VALID_UUID)
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
    assert.equal(mapped.userId, "user_1")
    assert.equal(mapped.status, "active")
    assert.equal(mapped.currentPeriodStart?.toISOString(), now.toISOString())
    assert.equal(mapped.cancelAtPeriodEnd, false)
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

    assert.equal(quota.isOverLimit, true)
    assert.equal(quota.over.users, true)
    assert.equal(quota.over.professionals, false)
    assert.equal(quota.atCapacity.users, true)
    assert.equal(quota.atCapacity.professionals, false)
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

    assert.equal(quota.isOverLimit, false)
    assert.equal(quota.atCapacity.users, true)
    assert.equal(quota.atCapacity.professionals, true)
    assert.equal(quota.atCapacity.storage, false)
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

    assert.equal(quota.isOverLimit, false)
    assert.equal(quota.atCapacity.users, false)
  })
})

describe("formatStorageBytes", () => {
  it("formats bytes, KB, MB and GB", () => {
    assert.equal(formatStorageBytes(0), "0 B")
    assert.equal(formatStorageBytes(512), "512 B")
    assert.equal(formatStorageBytes(1024), "1 KB")
    assert.equal(formatStorageBytes(1536), "1,5 KB")
    assert.equal(formatStorageBytes(1024 * 1024), "1 MB")
    assert.equal(formatStorageBytes(1024 * 1024 * 1024), "1 GB")
  })
})
