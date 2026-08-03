import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  createClinicServiceSchema,
  updateClinicServiceSchema,
} from "@/modules/billing/schemas/clinic-service.schema"
import { computeChargeAmountCents } from "@/modules/billing/utils/charge-pricing"
import { AppError, ErrorCode, isAppError } from "@/shared/errors"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("createClinicServiceSchema", () => {
  it("accepts valid payload with defaults", () => {
    const parsed = createClinicServiceSchema.parse({
      name: " Consulta ",
      priceCents: 15000,
    })
    assert.equal(parsed.name, "Consulta")
    assert.equal(parsed.priceCents, 15000)
    assert.equal(parsed.isActive, true)
  })

  it("rejects priceCents <= 0", () => {
    const zero = createClinicServiceSchema.safeParse({
      name: "Consulta",
      priceCents: 0,
    })
    assert.equal(zero.success, false)

    const negative = createClinicServiceSchema.safeParse({
      name: "Consulta",
      priceCents: -100,
    })
    assert.equal(negative.success, false)
  })

  it("rejects empty name", () => {
    const result = createClinicServiceSchema.safeParse({
      name: "   ",
      priceCents: 1000,
    })
    assert.equal(result.success, false)
  })
})

describe("updateClinicServiceSchema", () => {
  it("requires at least one field besides id", () => {
    const result = updateClinicServiceSchema.safeParse({ id: VALID_UUID })
    assert.equal(result.success, false)
  })

  it("accepts partial update", () => {
    const parsed = updateClinicServiceSchema.parse({
      id: VALID_UUID,
      priceCents: 20000,
    })
    assert.equal(parsed.priceCents, 20000)
  })
})

describe("computeChargeAmountCents", () => {
  it("returns 0 for courtesy and return", () => {
    assert.equal(
      computeChargeAmountCents({
        listAmountCents: 15000,
        discountPercent: 0,
        billingKind: "courtesy",
      }),
      0,
    )
    assert.equal(
      computeChargeAmountCents({
        listAmountCents: 15000,
        discountPercent: 10,
        billingKind: "return",
      }),
      0,
    )
  })

  it("applies discount rounding for standard billing", () => {
    assert.equal(
      computeChargeAmountCents({
        listAmountCents: 10000,
        discountPercent: 10,
        billingKind: "standard",
      }),
      9000,
    )
    assert.equal(
      computeChargeAmountCents({
        listAmountCents: 9999,
        discountPercent: 33,
        billingKind: "standard",
      }),
      6699,
    )
  })

  it("uses override when provided for standard billing", () => {
    assert.equal(
      computeChargeAmountCents({
        listAmountCents: 10000,
        discountPercent: 10,
        billingKind: "standard",
        amountCentsOverride: 7500,
      }),
      7500,
    )
  })

  it("rejects negative override", () => {
    try {
      computeChargeAmountCents({
        listAmountCents: 10000,
        discountPercent: 0,
        billingKind: "standard",
        amountCentsOverride: -1,
      })
      assert.fail("expected validation error")
    } catch (error) {
      assert.equal(isAppError(error), true)
      assert.equal((error as AppError).code, ErrorCode.VALIDATION_FAILED)
    }
  })
})
