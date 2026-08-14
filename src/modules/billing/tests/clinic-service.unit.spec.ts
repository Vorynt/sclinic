import { describe, expect, fail, it } from "@jest/globals"

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
    expect(parsed.name).toBe("Consulta")
    expect(parsed.priceCents).toBe(15000)
    expect(parsed.isActive).toBe(true)
  })

  it("rejects priceCents <= 0", () => {
    const zero = createClinicServiceSchema.safeParse({
      name: "Consulta",
      priceCents: 0,
    })
    expect(zero.success).toBe(false)

    const negative = createClinicServiceSchema.safeParse({
      name: "Consulta",
      priceCents: -100,
    })
    expect(negative.success).toBe(false)
  })

  it("rejects empty name", () => {
    const result = createClinicServiceSchema.safeParse({
      name: "   ",
      priceCents: 1000,
    })
    expect(result.success).toBe(false)
  })
})

describe("updateClinicServiceSchema", () => {
  it("requires at least one field besides id", () => {
    const result = updateClinicServiceSchema.safeParse({ id: VALID_UUID })
    expect(result.success).toBe(false)
  })

  it("accepts partial update", () => {
    const parsed = updateClinicServiceSchema.parse({
      id: VALID_UUID,
      priceCents: 20000,
    })
    expect(parsed.priceCents).toBe(20000)
  })
})

describe("computeChargeAmountCents", () => {
  it("returns 0 for courtesy and return", () => {
    expect(computeChargeAmountCents({
        listAmountCents: 15000,
        discountPercent: 0,
        billingKind: "courtesy",
      })).toBe(0)
    expect(computeChargeAmountCents({
        listAmountCents: 15000,
        discountPercent: 10,
        billingKind: "return",
      })).toBe(0)
  })

  it("applies discount rounding for standard billing", () => {
    expect(computeChargeAmountCents({
        listAmountCents: 10000,
        discountPercent: 10,
        billingKind: "standard",
      })).toBe(9000)
    expect(computeChargeAmountCents({
        listAmountCents: 9999,
        discountPercent: 33,
        billingKind: "standard",
      })).toBe(6699)
  })

  it("uses override when provided for standard billing", () => {
    expect(computeChargeAmountCents({
        listAmountCents: 10000,
        discountPercent: 10,
        billingKind: "standard",
        amountCentsOverride: 7500,
      })).toBe(7500)
  })

  it("rejects negative override", () => {
    try {
      computeChargeAmountCents({
        listAmountCents: 10000,
        discountPercent: 0,
        billingKind: "standard",
        amountCentsOverride: -1,
      })
      fail("expected validation error")
    } catch (error) {
      expect(isAppError(error)).toBe(true)
      expect((error as AppError).code).toBe(ErrorCode.VALIDATION_FAILED)
    }
  })
})
