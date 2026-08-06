import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  createChargeFromAppointmentSchema,
  listChargesSchema,
  markChargePaidSchema,
} from "@/modules/billing/schemas/charge.schema"
import { endOfClinicLocalDay } from "@/modules/billing/utils/charge-due-date"
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
const SERVICE_UUID = "22222222-2222-4222-8222-222222222222"

describe("createChargeFromAppointmentSchema", () => {
  it("accepts catalog pricing fields", () => {
    const parsed = createChargeFromAppointmentSchema.parse({
      appointmentId: VALID_UUID,
      serviceId: SERVICE_UUID,
      discountPercent: 10,
      billingKind: "standard",
      description: " Consulta ",
    })
    assert.equal(parsed.serviceId, SERVICE_UUID)
    assert.equal(parsed.discountPercent, 10)
    assert.equal(parsed.billingKind, "standard")
    assert.equal(parsed.description, "Consulta")
  })

  it("accepts amountCentsOverride of zero", () => {
    const parsed = createChargeFromAppointmentSchema.parse({
      appointmentId: VALID_UUID,
      serviceId: SERVICE_UUID,
      amountCentsOverride: 0,
    })
    assert.equal(parsed.amountCentsOverride, 0)
  })

  it("rejects courtesy with amount override", () => {
    const result = createChargeFromAppointmentSchema.safeParse({
      appointmentId: VALID_UUID,
      serviceId: SERVICE_UUID,
      billingKind: "courtesy",
      amountCentsOverride: 1000,
    })
    assert.equal(result.success, false)
  })
})

describe("markChargePaidSchema", () => {
  it("accepts manual payment methods with optional discount", () => {
    const parsed = markChargePaidSchema.parse({
      chargeId: VALID_UUID,
      method: "pix_manual",
      discountPercent: 15,
    })
    assert.equal(parsed.method, "pix_manual")
    assert.equal(parsed.discountPercent, 15)
  })

  it("rejects gateway method in MVP", () => {
    const result = markChargePaidSchema.safeParse({
      chargeId: VALID_UUID,
      method: "gateway",
    })
    assert.equal(result.success, false)
  })

  it("rejects courtesy method in manual mark paid", () => {
    const result = markChargePaidSchema.safeParse({
      chargeId: VALID_UUID,
      method: "courtesy",
    })
    assert.equal(result.success, false)
  })
})

describe("listChargesSchema", () => {
  it("keeps overdue unset by default", () => {
    const parsed = listChargesSchema.parse({})
    assert.equal(parsed.overdue, undefined)
  })

  it("accepts an overdue boolean filter", () => {
    const parsed = listChargesSchema.parse({ overdue: true })
    assert.equal(parsed.overdue, true)
  })
})

describe("endOfClinicLocalDay", () => {
  it("returns 23:59:59.999 of the same day in the clinic timezone", () => {
    const startsAt = new Date("2026-03-10T13:00:00.000Z")
    const dueAt = endOfClinicLocalDay(startsAt, "America/Sao_Paulo")

    assert.equal(dueAt.toISOString(), "2026-03-11T02:59:59.999Z")
  })

  it("rolls over correctly near a UTC day boundary", () => {
    const startsAt = new Date("2026-06-01T23:30:00.000Z")
    const dueAt = endOfClinicLocalDay(startsAt, "America/Sao_Paulo")

    assert.equal(dueAt.getTime() > startsAt.getTime(), true)
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
    try {
      assertAppointmentChargeable("canceled")
      assert.fail("expected conflict")
    } catch (error) {
      assert.equal(isAppError(error), true)
      assert.equal((error as AppError).code, ErrorCode.CONFLICT)
    }
  })
})

describe("money utils", () => {
  it("parses BRL to cents", () => {
    assert.equal(parseBrlToCents("150,00"), 15000)
    assert.equal(parseBrlToCents("1.250,50"), 125050)
  })

  it("detects empty money input", () => {
    assert.equal(isEmptyMoneyInput(""), true)
    assert.equal(isEmptyMoneyInput("  "), true)
    assert.equal(isEmptyMoneyInput("10"), false)
  })
})
