import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { clinicWeeklyHoursSchema } from "@/modules/clinics/schemas/clinic-hours.schema"
import { toClinicWeeklyHours } from "@/modules/clinics/mappers/clinic-hours.mapper"
import {
  isWithinClinicHours,
  timeToMinutes,
} from "@/modules/clinics/utils/clinic-hours-window"
import { formatDayHoursSummary } from "@/modules/clinics/utils/format-day-hours-summary"
import type { ClinicBusinessHours } from "@/db/schema"

describe("clinicWeeklyHoursSchema", () => {
  it("accepts a full week with two intervals", () => {
    const days = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      isClosed: dayOfWeek === 0,
      intervals:
        dayOfWeek === 0
          ? []
          : [
              { opensAt: "08:00", closesAt: "12:00" },
              { opensAt: "14:00", closesAt: "18:00" },
            ],
    }))

    const parsed = clinicWeeklyHoursSchema.parse({ days })
    assert.equal(parsed.days.length, 7)
    assert.equal(parsed.days[1]?.intervals.length, 2)
  })

  it("rejects overlapping intervals", () => {
    const days = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      isClosed: false,
      intervals: [
        { opensAt: "08:00", closesAt: "14:00" },
        { opensAt: "13:00", closesAt: "18:00" },
      ],
    }))

    const result = clinicWeeklyHoursSchema.safeParse({ days })
    assert.equal(result.success, false)
  })
})

describe("toClinicWeeklyHours", () => {
  it("maps second interval columns", () => {
    const row = {
      id: "11111111-1111-4111-8111-111111111111",
      clinicId: "22222222-2222-4222-8222-222222222222",
      dayOfWeek: 1,
      opensAt: "08:00:00",
      closesAt: "12:00:00",
      secondOpensAt: "14:00:00",
      secondClosesAt: "18:00:00",
      isClosed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } satisfies ClinicBusinessHours

    const week = toClinicWeeklyHours([row])
    assert.deepEqual(week[1]?.intervals, [
      { opensAt: "08:00", closesAt: "12:00" },
      { opensAt: "14:00", closesAt: "18:00" },
    ])
  })
})

describe("isWithinClinicHours", () => {
  const weeklyHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: false,
    intervals: [
      { opensAt: "08:00", closesAt: "12:00" },
      { opensAt: "14:00", closesAt: "18:00" },
    ],
  }))

  it("allows a slot inside the morning interval", () => {
    // 2026-07-23 is Thursday in America/Sao_Paulo
    const startsAt = new Date("2026-07-23T12:00:00.000Z") // 09:00 BRT
    const endsAt = new Date("2026-07-23T12:30:00.000Z")

    assert.equal(
      isWithinClinicHours({
        startsAt,
        endsAt,
        weeklyHours,
        timeZone: "America/Sao_Paulo",
      }),
      true,
    )
  })

  it("rejects a slot during lunch break", () => {
    const startsAt = new Date("2026-07-23T16:00:00.000Z") // 13:00 BRT
    const endsAt = new Date("2026-07-23T16:30:00.000Z")

    assert.equal(
      isWithinClinicHours({
        startsAt,
        endsAt,
        weeklyHours,
        timeZone: "America/Sao_Paulo",
      }),
      false,
    )
  })

  it("converts HH:mm to minutes", () => {
    assert.equal(timeToMinutes("07:00"), 420)
    assert.equal(timeToMinutes("19:00"), 1140)
  })
})

describe("formatDayHoursSummary", () => {
  it("returns Fechado when closed or empty", () => {
    assert.equal(
      formatDayHoursSummary({ isClosed: true, intervals: [] }),
      "Fechado",
    )
    assert.equal(
      formatDayHoursSummary({ isClosed: false, intervals: [] }),
      "Fechado",
    )
  })

  it("joins one or two intervals", () => {
    assert.equal(
      formatDayHoursSummary({
        isClosed: false,
        intervals: [{ opensAt: "08:00", closesAt: "18:00" }],
      }),
      "08:00–18:00",
    )
    assert.equal(
      formatDayHoursSummary({
        isClosed: false,
        intervals: [
          { opensAt: "08:00", closesAt: "12:00" },
          { opensAt: "14:00", closesAt: "18:00" },
        ],
      }),
      "08:00–12:00, 14:00–18:00",
    )
  })
})
