import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  createChargeFromAppointmentSchema,
  markChargePaidSchema,
} from "@/modules/billing/schemas/charge.schema"
import {
  assertAppointmentChargeable,
  assertChargePendingForCancel,
  assertChargePendingForPayment,
} from "@/modules/billing/utils/charge-rules"
import {
  isEmptyMoneyInput,
  parseBrlToCents,
} from "@/modules/billing/utils/money"
import { AppError, ErrorCode, isAppError } from "@/shared/errors"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("createChargeFromAppointmentSchema", () => {
  it("accepts positive amountCents", () => {
    const parsed = createChargeFromAppointmentSchema.parse({
      appointmentId: VALID_UUID,
      amountCents: 15000,
      description: " Consulta ",
    })
    assert.equal(parsed.amountCents, 15000)
    assert.equal(parsed.description, "Consulta")
  })

  it("rejects amountCents <= 0", () => {
    const zero = createChargeFromAppointmentSchema.safeParse({
      appointmentId: VALID_UUID,
      amountCents: 0,
    })
    assert.equal(zero.success, false)

    const negative = createChargeFromAppointmentSchema.safeParse({
      appointmentId: VALID_UUID,
      amountCents: -100,
    })
    assert.equal(negative.success, false)
  })
})

describe("markChargePaidSchema", () => {
  it("accepts manual payment methods", () => {
    const parsed = markChargePaidSchema.parse({
      chargeId: VALID_UUID,
      method: "pix_manual",
    })
    assert.equal(parsed.method, "pix_manual")
  })

  it("rejects gateway method in MVP", () => {
    const result = markChargePaidSchema.safeParse({
      chargeId: VALID_UUID,
      method: "gateway",
    })
    assert.equal(result.success, false)
  })
})

describe("charge-rules", () => {
  it("allows mark paid only when pending", () => {
    assert.doesNotThrow(() => assertChargePendingForPayment("pending"))

    for (const status of ["paid", "canceled", "failed"] as const) {
      try {
        assertChargePendingForPayment(status)
        assert.fail(`expected conflict for ${status}`)
      } catch (error) {
        assert.equal(isAppError(error), true)
        assert.equal((error as AppError).code, ErrorCode.CONFLICT)
      }
    }
  })

  it("allows cancel only when pending", () => {
    assert.doesNotThrow(() => assertChargePendingForCancel("pending"))

    try {
      assertChargePendingForCancel("paid")
      assert.fail("expected conflict")
    } catch (error) {
      assert.equal(isAppError(error), true)
      assert.equal((error as AppError).code, ErrorCode.CONFLICT)
    }
  })

  it("blocks charge on canceled appointment", () => {
    assert.doesNotThrow(() => assertAppointmentChargeable("completed"))
    try {
      assertAppointmentChargeable("canceled")
      assert.fail("expected conflict")
    } catch (error) {
      assert.equal(isAppError(error), true)
      assert.equal((error as AppError).code, ErrorCode.CONFLICT)
    }
  })
})

describe("parseBrlToCents", () => {
  it("parses Brazilian and plain decimals", () => {
    assert.equal(parseBrlToCents("150,50"), 15050)
    assert.equal(parseBrlToCents("1.150,50"), 115050)
    assert.equal(parseBrlToCents("150.5"), 15050)
    assert.equal(parseBrlToCents("R$ 150,50"), 15050)
  })

  it("rejects empty or non-positive values", () => {
    assert.equal(parseBrlToCents(""), null)
    assert.equal(parseBrlToCents("0"), null)
    assert.equal(parseBrlToCents("0.00"), null)
    assert.equal(parseBrlToCents("-10"), null)
  })
})

describe("isEmptyMoneyInput", () => {
  it("treats blank and zero-like values as empty", () => {
    assert.equal(isEmptyMoneyInput(""), true)
    assert.equal(isEmptyMoneyInput("0"), true)
    assert.equal(isEmptyMoneyInput("0,00"), true)
    assert.equal(isEmptyMoneyInput("0.00"), true)
    assert.equal(isEmptyMoneyInput("R$ 0,00"), true)
  })

  it("treats positive amounts as filled", () => {
    assert.equal(isEmptyMoneyInput("150,50"), false)
    assert.equal(isEmptyMoneyInput("1.50"), false)
  })
})
