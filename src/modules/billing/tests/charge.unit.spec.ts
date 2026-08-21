import { describe, expect, fail, it } from "@jest/globals"

import {
  billingInsightsSchema,
  createChargeFromAppointmentSchema,
  listChargesSchema,
  markChargePaidSchema,
} from "@/modules/billing/schemas/charge.schema"
import type { ChargeListItem } from "@/modules/billing/types/charge"
import { CHARGE_EXPORT_MAX_ROWS } from "@/modules/billing/constants/charges"
import {
  chargesExportFilename,
  chargesToCsv,
} from "@/modules/billing/mappers/charges-csv"
import { endOfClinicLocalDay } from "@/modules/billing/utils/charge-due-date"
import {
  lastDaysIsoRange,
  resolveChargePeriod,
  toZonedIsoDate,
} from "@/modules/billing/utils/charge-period"
import {
  assertAppointmentChargeable,
  assertChargePendingForCancel,
  assertChargePendingForPayment,
} from "@/modules/billing/utils/charge-rules"
import { describeChargeExportFilters } from "@/modules/billing/utils/charge-export-filters"
import {
  countChargeSheetFilters,
  DEFAULT_CHARGE_SHEET_FILTERS,
  listChargeSheetFilterChips,
  resolveChargePeriodPreset,
} from "@/modules/billing/utils/charge-sheet-filters"
import { describeTopPaymentMethod } from "@/modules/billing/utils/billing-insight-copy"
import {
  fillChargeInsightTimeBuckets,
  isoWeekMonday,
} from "@/modules/billing/utils/fill-insight-time-buckets"
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

  it("accepts period and domain filters", () => {
    const parsed = listChargesSchema.parse({
      from: "2026-08-01",
      to: "2026-08-31",
      billingKind: "standard",
      method: "pix_manual",
      serviceId: SERVICE_UUID,
      patientId: VALID_UUID,
    })
    expect(parsed.from).toBe("2026-08-01")
    expect(parsed.to).toBe("2026-08-31")
    expect(parsed.method).toBe("pix_manual")
    expect(parsed.patientId).toBe(VALID_UUID)
  })

  it("rejects inverted date range", () => {
    const result = listChargesSchema.safeParse({
      from: "2026-08-31",
      to: "2026-08-01",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid ISO dates", () => {
    const result = listChargesSchema.safeParse({ from: "2026-02-31" })
    expect(result.success).toBe(false)
  })
})

describe("billingInsightsSchema", () => {
  it("does not require pagination", () => {
    const parsed = billingInsightsSchema.parse({ periodAll: true })
    expect(parsed.periodAll).toBe(true)
    expect("page" in parsed).toBe(false)
  })
})

describe("resolveChargePeriod", () => {
  const timeZone = "America/Sao_Paulo"
  const now = new Date("2026-08-21T13:00:00.000Z")

  it("defaults to the current clinic-local month", () => {
    const period = resolveChargePeriod({ timeZone, now })
    expect(period.from).toBe("2026-08-01")
    expect(period.to).toBe("2026-08-31")
    expect(period.periodAll).toBe(false)
    expect(period.grain).toBe("day")
    expect(period.startsAtFrom?.toISOString()).toBe("2026-08-01T03:00:00.000Z")
    expect(period.startsAtTo?.toISOString()).toBe("2026-09-01T02:59:59.999Z")
  })

  it("skips the date filter when periodAll is set", () => {
    const period = resolveChargePeriod({
      timeZone,
      now,
      periodAll: true,
      from: "2026-01-01",
      to: "2026-01-31",
    })
    expect(period.periodAll).toBe(true)
    expect(period.startsAtFrom).toBe(undefined)
    expect(period.grain).toBe("week")
  })

  it("uses week grain for ranges longer than 45 days", () => {
    const period = resolveChargePeriod({
      timeZone,
      now,
      from: "2026-01-01",
      to: "2026-08-21",
    })
    expect(period.grain).toBe("week")
  })

  it("formats a zoned ISO date", () => {
    expect(toZonedIsoDate(now, timeZone)).toBe("2026-08-21")
  })
})

describe("chargesToCsv", () => {
  it("emits a semicolon-separated header and escaped rows", () => {
    const item = {
      id: VALID_UUID,
      clinicId: VALID_UUID,
      patientId: VALID_UUID,
      appointmentId: VALID_UUID,
      serviceId: SERVICE_UUID,
      serviceName: 'Consulta "retorno"',
      listAmountCents: 15000,
      discountPercent: 0,
      amountCents: 15000,
      currency: "BRL",
      status: "paid",
      billingKind: "standard",
      description: null,
      dueAt: new Date("2026-08-21T02:59:59.999Z"),
      provider: "none",
      providerChargeId: null,
      createdAt: new Date("2026-08-20T12:00:00.000Z"),
      updatedAt: new Date("2026-08-20T12:00:00.000Z"),
      patientName: "Ana; Silva",
      appointmentStartsAt: new Date("2026-08-20T15:00:00.000Z"),
      paymentMethod: "pix_manual",
    } satisfies ChargeListItem

    const csv = chargesToCsv([item])
    const [header, row] = csv.split("\n")
    expect(header).toContain("Paciente")
    expect(header).toContain("Forma de pagamento")
    expect(row).toContain('"Ana; Silva"')
    expect(row).toContain('Consulta ""retorno""')
    expect(row).toContain("PIX")
  })

  it("names the file from the resolved period and keeps the export cap", () => {
    expect(CHARGE_EXPORT_MAX_ROWS).toBe(2000)
    expect(
      chargesExportFilename({
        from: "2026-08-01",
        to: "2026-08-31",
        periodAll: false,
      }),
    ).toBe("faturamento-2026-08-01-2026-08-31.csv")
    expect(
      chargesExportFilename({ from: null, to: null, periodAll: true }),
    ).toBe("faturamento-completo.csv")
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

describe("describeChargeExportFilters", () => {
  it("labels the current month when no period is set", () => {
    expect(describeChargeExportFilters({ filters: {} })).toEqual([
      { label: "Período", value: "Mês corrente" },
    ])
  })

  it("describes explicit period, search and overdue", () => {
    expect(
      describeChargeExportFilters({
        filters: {
          periodAll: false,
          from: "2026-08-01",
          to: "2026-08-31",
          q: "ana",
          overdue: true,
          status: "pending",
        },
      }),
    ).toEqual([
      { label: "Período", value: "01/08/2026 — 31/08/2026" },
      { label: "Busca", value: "ana" },
      { label: "Status", value: "Pendente" },
      { label: "Vencidas", value: "Somente vencidas" },
    ])
  })

  it("uses service and patient names when provided", () => {
    expect(
      describeChargeExportFilters({
        filters: {
          periodAll: true,
          serviceId: SERVICE_UUID,
          patientId: VALID_UUID,
          billingKind: "courtesy",
          method: "pix_manual",
        },
        serviceName: "Consulta",
        patientName: "Ana Souza",
      }),
    ).toEqual([
      { label: "Período", value: "Todo o período" },
      { label: "Tipo", value: "Cortesia" },
      { label: "Pagamento", value: "PIX" },
      { label: "Serviço", value: "Consulta" },
      { label: "Paciente", value: "Ana Souza" },
    ])
  })
})

describe("describeTopPaymentMethod", () => {
  it("returns null when there are no received amounts", () => {
    expect(describeTopPaymentMethod([])).toBeNull()
    expect(
      describeTopPaymentMethod([{ method: "pix_manual", amountCents: 0 }]),
    ).toBeNull()
  })

  it("names the method with the highest received amount", () => {
    expect(
      describeTopPaymentMethod([
        { method: "cash", amountCents: 1000 },
        { method: "pix_manual", amountCents: 5000 },
        { method: "card", amountCents: 2500 },
      ]),
    ).toBe("A maior parte entrou via PIX.")
  })
})

describe("fillChargeInsightTimeBuckets", () => {
  it("fills missing days in a 7-day range with zeros", () => {
    const filled = fillChargeInsightTimeBuckets({
      grain: "day",
      from: "2026-08-15",
      to: "2026-08-21",
      rows: [
        {
          bucket: "2026-08-16",
          billedCents: 10000,
          receivedCents: 5000,
          count: 1,
        },
        {
          bucket: "2026-08-20",
          billedCents: 2000,
          receivedCents: 2000,
          count: 1,
        },
      ],
    })

    expect(filled.map((row) => row.bucket)).toEqual([
      "2026-08-15",
      "2026-08-16",
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
    ])
    expect(filled[0]).toEqual({
      bucket: "2026-08-15",
      billedCents: 0,
      receivedCents: 0,
      count: 0,
    })
    expect(filled[1]?.receivedCents).toBe(5000)
    expect(filled[5]?.receivedCents).toBe(2000)
  })

  it("fills ISO weeks matching Postgres date_trunc week (Monday)", () => {
    expect(isoWeekMonday("2026-08-16")).toBe("2026-08-10")
    expect(isoWeekMonday("2026-08-17")).toBe("2026-08-17")

    const filled = fillChargeInsightTimeBuckets({
      grain: "week",
      from: "2026-08-01",
      to: "2026-08-21",
      rows: [
        {
          bucket: "2026-08-17",
          billedCents: 3000,
          receivedCents: 3000,
          count: 2,
        },
      ],
    })

    expect(filled.map((row) => row.bucket)).toEqual([
      "2026-07-27",
      "2026-08-03",
      "2026-08-10",
      "2026-08-17",
    ])
    expect(filled[3]?.receivedCents).toBe(3000)
    expect(filled[0]?.count).toBe(0)
  })

  it("fills gaps between first and last bucket when the period is open", () => {
    const filled = fillChargeInsightTimeBuckets({
      grain: "day",
      from: null,
      to: null,
      rows: [
        {
          bucket: "2026-08-10",
          billedCents: 100,
          receivedCents: 100,
          count: 1,
        },
        {
          bucket: "2026-08-12",
          billedCents: 200,
          receivedCents: 200,
          count: 1,
        },
      ],
    })

    expect(filled.map((row) => row.bucket)).toEqual([
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
    ])
  })
})

describe("charge sheet filters", () => {
  const timeZone = "America/Sao_Paulo"
  const now = new Date("2026-08-21T13:00:00.000Z")

  it("resolves presets including last-30 without treating them as custom", () => {
    expect(
      resolveChargePeriodPreset({
        from: null,
        to: null,
        periodAll: false,
        timeZone,
        now,
      }),
    ).toBe("this-month")

    const last30 = lastDaysIsoRange(now, timeZone, 30)
    expect(
      resolveChargePeriodPreset({
        ...last30,
        periodAll: false,
        timeZone,
        now,
      }),
    ).toBe("last-30")

    expect(
      resolveChargePeriodPreset({
        from: "2026-08-01",
        to: "2026-08-07",
        periodAll: false,
        timeZone,
        now,
      }),
    ).toBe("custom")
  })

  it("counts only sheet-hidden filters and custom period", () => {
    expect(
      countChargeSheetFilters(DEFAULT_CHARGE_SHEET_FILTERS, { timeZone, now }),
    ).toBe(0)

    expect(
      countChargeSheetFilters(
        {
          ...DEFAULT_CHARGE_SHEET_FILTERS,
          status: "pending",
          overdue: true,
          from: "2026-08-01",
          to: "2026-08-07",
        },
        { timeZone, now },
      ),
    ).toBe(3)
  })

  it("lists chips for custom period and overdue", () => {
    const chips = listChargeSheetFilterChips(
      {
        ...DEFAULT_CHARGE_SHEET_FILTERS,
        from: "2026-08-01",
        to: "2026-08-07",
        overdue: true,
        serviceId: SERVICE_UUID,
      },
      { timeZone, now, serviceName: "Consulta" },
    )
    expect(chips.map((chip) => chip.label)).toEqual([
      "01/08/2026–07/08/2026",
      "Consulta",
      "Somente vencidas",
    ])
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
