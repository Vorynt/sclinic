import { describe, expect, fail, it } from "@jest/globals"

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
    expect(parsed.serviceId).toBe(SERVICE_UUID)
    expect(parsed.discountPercent).toBe(10)
    expect(parsed.billingKind).toBe("standard")
    expect(parsed.description).toBe("Consulta")
  })

  it("accepts amountCentsOverride of zero", () => {
    const parsed = createChargeFromAppointmentSchema.parse({
      appointmentId: VALID_UUID,
      serviceId: SERVICE_UUID,
      amountCentsOverride: 0,
    })
    expect(parsed.amountCentsOverride).toBe(0)
  })

  it("rejects courtesy with amount override", () => {
    const result = createChargeFromAppointmentSchema.safeParse({
      appointmentId: VALID_UUID,
      serviceId: SERVICE_UUID,
      billingKind: "courtesy",
      amountCentsOverride: 1000,
    })
    expect(result.success).toBe(false)
  })
})

describe("markChargePaidSchema", () => {
  it("accepts manual payment methods with optional discount", () => {
    const parsed = markChargePaidSchema.parse({
      chargeId: VALID_UUID,
      method: "pix_manual",
      discountPercent: 15,
    })
    expect(parsed.method).toBe("pix_manual")
    expect(parsed.discountPercent).toBe(15)
  })

  it("rejects gateway method in MVP", () => {
    const result = markChargePaidSchema.safeParse({
      chargeId: VALID_UUID,
      method: "gateway",
    })
    expect(result.success).toBe(false)
  })

  it("rejects courtesy method in manual mark paid", () => {
    const result = markChargePaidSchema.safeParse({
      chargeId: VALID_UUID,
      method: "courtesy",
    })
    expect(result.success).toBe(false)
  })
})

describe("listChargesSchema", () => {
  it("keeps overdue unset by default", () => {
    const parsed = listChargesSchema.parse({})
    expect(parsed.overdue).toBe(undefined)
  })

  it("accepts an overdue boolean filter", () => {
    const parsed = listChargesSchema.parse({ overdue: true })
    expect(parsed.overdue).toBe(true)
  })
})

describe("endOfClinicLocalDay", () => {
  it("returns 23:59:59.999 of the same day in the clinic timezone", () => {
    const startsAt = new Date("2026-03-10T13:00:00.000Z")
    const dueAt = endOfClinicLocalDay(startsAt, "America/Sao_Paulo")

    expect(dueAt.toISOString()).toBe("2026-03-11T02:59:59.999Z")
  })

  it("rolls over correctly near a UTC day boundary", () => {
    const startsAt = new Date("2026-06-01T23:30:00.000Z")
    const dueAt = endOfClinicLocalDay(startsAt, "America/Sao_Paulo")

    expect(dueAt.getTime() > startsAt.getTime()).toBe(true)
  })
})

describe("charge-rules", () => {
  it("allows mark paid only when pending", () => {
    expect(() => assertChargePendingForPayment("pending")).not.toThrow()

    for (const status of ["paid", "canceled", "failed"] as const) {
      try {
        assertChargePendingForPayment(status)
        fail(`expected conflict for ${status}`)
      } catch (error) {
        expect(isAppError(error)).toBe(true)
        expect((error as AppError).code).toBe(ErrorCode.CONFLICT)
      }
    }
  })

  it("allows cancel only when pending", () => {
    expect(() => assertChargePendingForCancel("pending")).not.toThrow()

    try {
      assertChargePendingForCancel("paid")
      fail("expected conflict")
    } catch (error) {
      expect(isAppError(error)).toBe(true)
      expect((error as AppError).code).toBe(ErrorCode.CONFLICT)
    }
  })

  it("blocks charge on canceled appointment", () => {
    try {
      assertAppointmentChargeable("canceled")
      fail("expected conflict")
    } catch (error) {
      expect(isAppError(error)).toBe(true)
      expect((error as AppError).code).toBe(ErrorCode.CONFLICT)
    }
  })
})

describe("money utils", () => {
  it("parses BRL to cents", () => {
    expect(parseBrlToCents("150,00")).toBe(15000)
    expect(parseBrlToCents("1.250,50")).toBe(125050)
  })

  it("detects empty money input", () => {
    expect(isEmptyMoneyInput("")).toBe(true)
    expect(isEmptyMoneyInput("  ")).toBe(true)
    expect(isEmptyMoneyInput("10")).toBe(false)
  })
})
