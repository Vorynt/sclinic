import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { auditErrorFields } from "@/core/events"
import type { AuditLogRow } from "@/db/schema"
import {
  diffClinicWeeklyHours,
  formatClinicDaySchedule,
  summarizeClinicHoursChanges,
} from "@/modules/audit/mappers/audit-hours-changes.mapper"
import { toAuditLog } from "@/modules/audit/mappers/audit.mapper"
import { listAuditLogsSchema } from "@/modules/audit/schemas/audit.schema"
import { AppError, ErrorCode } from "@/shared/errors"

describe("listAuditLogsSchema", () => {
  it("applies list defaults and accepts optional filters", () => {
    const parsed = listAuditLogsSchema.parse({
      status: "error",
      entityType: "patient",
    })
    assert.equal(parsed.page, 1)
    assert.equal(parsed.status, "error")
    assert.equal(parsed.entityType, "patient")
  })

  it("rejects invalid status", () => {
    const result = listAuditLogsSchema.safeParse({ status: "pending" })
    assert.equal(result.success, false)
  })
})

describe("toAuditLog", () => {
  it("maps drizzle row to domain audit log", () => {
    const createdAt = new Date("2026-07-24T12:00:00.000Z")
    const row = {
      id: "11111111-1111-4111-8111-111111111111",
      clinicId: "22222222-2222-4222-8222-222222222222",
      actorUserId: "user_1",
      actorName: "Ana",
      actorEmail: "ana@example.com",
      action: "patient.create",
      status: "success",
      entityType: "patient",
      entityId: "33333333-3333-4333-8333-333333333333",
      changes: { after: { name: "Maria" } },
      errorMessage: null,
      errorCode: null,
      createdAt,
      updatedAt: createdAt,
    } satisfies AuditLogRow

    const log = toAuditLog(row)
    assert.equal(log.action, "patient.create")
    assert.equal(log.status, "success")
    assert.deepEqual(log.changes, { after: { name: "Maria" } })
    assert.equal(log.createdAt.toISOString(), createdAt.toISOString())
  })
})

describe("auditErrorFields", () => {
  it("extracts AppError message and code", () => {
    const fields = auditErrorFields(
      new AppError(ErrorCode.CONFLICT, {
        message: "Já existe um paciente com este CPF nesta clínica.",
      }),
    )
    assert.equal(fields.errorCode, ErrorCode.CONFLICT)
    assert.match(fields.errorMessage, /CPF/)
  })
})

describe("audit hours changes mapper", () => {
  const week = (overrides: Partial<Record<number, {
    isClosed: boolean
    intervals: { opensAt: string; closesAt: string }[]
  }>> = {}) =>
    Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      isClosed: overrides[dayOfWeek]?.isClosed ?? true,
      intervals: overrides[dayOfWeek]?.intervals ?? [],
    }))

  it("formats closed and open days", () => {
    assert.equal(
      formatClinicDaySchedule({
        dayOfWeek: 1,
        isClosed: true,
        intervals: [],
      }),
      "Fechado",
    )
    assert.equal(
      formatClinicDaySchedule({
        dayOfWeek: 1,
        isClosed: false,
        intervals: [
          { opensAt: "08:00", closesAt: "12:00" },
          { opensAt: "14:00", closesAt: "18:00" },
        ],
      }),
      "08:00–12:00, 14:00–18:00",
    )
  })

  it("diffs only changed weekdays with friendly labels", () => {
    const before = week({
      1: {
        isClosed: false,
        intervals: [{ opensAt: "08:00", closesAt: "18:00" }],
      },
      2: {
        isClosed: false,
        intervals: [{ opensAt: "08:00", closesAt: "18:00" }],
      },
    })
    const after = week({
      1: {
        isClosed: false,
        intervals: [{ opensAt: "09:00", closesAt: "17:00" }],
      },
      2: {
        isClosed: false,
        intervals: [{ opensAt: "08:00", closesAt: "18:00" }],
      },
      3: { isClosed: true, intervals: [] },
    })

    const diffs = diffClinicWeeklyHours(before, after)
    assert.equal(diffs.length, 1)
    assert.equal(diffs[0]?.dayLabel, "Segunda")
    assert.equal(diffs[0]?.beforeLabel, "08:00–18:00")
    assert.equal(diffs[0]?.afterLabel, "09:00–17:00")
  })

  it("summarizes changed days for the card preview", () => {
    const before = week({
      1: {
        isClosed: false,
        intervals: [{ opensAt: "08:00", closesAt: "18:00" }],
      },
    })
    const after = week({
      1: { isClosed: true, intervals: [] },
      5: {
        isClosed: false,
        intervals: [{ opensAt: "08:00", closesAt: "12:00" }],
      },
    })

    assert.equal(
      summarizeClinicHoursChanges(before, after),
      "Alterou: Segunda, Sexta",
    )
  })
})
