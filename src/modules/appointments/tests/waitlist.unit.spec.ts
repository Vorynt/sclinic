import { describe, expect, fail, it } from "@jest/globals"

import {
  toWaitlistEntry,
  type WaitlistRow,
} from "@/modules/appointments/mappers/waitlist.mapper"
import {
  cancelWaitlistSchema,
  enqueueWaitlistSchema,
  promoteWaitlistSchema,
} from "@/modules/appointments/schemas/waitlist.schema"
import type { WaitlistEntry } from "@/modules/appointments/types/waitlist"
import { assertWaitlistPromotable } from "@/modules/appointments/utils/waitlist-rules"
import { AppError, ErrorCode, isAppError } from "@/shared/errors"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"
const OTHER_UUID = "22222222-2222-4222-8222-222222222222"

function futureRange(hoursFromNow = 24, durationMinutes = 30) {
  const startsAt = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000)
  return { startsAt, endsAt }
}

function buildEntry(overrides: Partial<WaitlistEntry> = {}): WaitlistEntry {
  const now = new Date()
  return {
    id: VALID_UUID,
    clinicId: OTHER_UUID,
    patientId: VALID_UUID,
    patientName: "Maria Silva",
    professionalId: null,
    professionalName: null,
    serviceId: null,
    serviceName: null,
    status: "waiting",
    notes: null,
    promotedAppointmentId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function buildRow(overrides: Partial<WaitlistRow> = {}): WaitlistRow {
  const now = new Date()
  return {
    id: VALID_UUID,
    clinicId: OTHER_UUID,
    patientId: VALID_UUID,
    patientName: "Maria Silva",
    professionalId: null,
    professionalName: null,
    serviceId: null,
    serviceName: null,
    status: "waiting",
    notes: null,
    promotedAppointmentId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe("toWaitlistEntry", () => {
  it("maps a row to the domain waitlist shape", () => {
    const now = new Date()
    const entry = toWaitlistEntry(
      buildRow({
        professionalId: OTHER_UUID,
        professionalName: "Dr. João",
        serviceId: VALID_UUID,
        serviceName: "Consulta",
        notes: "prefere manhã",
        createdAt: now,
        updatedAt: now,
      }),
    )

    expect(entry.id).toBe(VALID_UUID)
    expect(entry.patientName).toBe("Maria Silva")
    expect(entry.professionalName).toBe("Dr. João")
    expect(entry.serviceName).toBe("Consulta")
    expect(entry.status).toBe("waiting")
    expect(entry.notes).toBe("prefere manhã")
  })

  it("falls back to waiting for an unexpected status", () => {
    const entry = toWaitlistEntry(buildRow({ status: "unknown" }))
    expect(entry.status).toBe("waiting")
  })
})

describe("enqueueWaitlistSchema", () => {
  it("requires a valid patientId and allows optional fields to be omitted", () => {
    const parsed = enqueueWaitlistSchema.parse({ patientId: VALID_UUID })
    expect(parsed.patientId).toBe(VALID_UUID)
    expect(parsed.professionalId).toBe(undefined)
    expect(parsed.serviceId).toBe(undefined)
  })

  it("trims notes and drops empty strings", () => {
    const parsed = enqueueWaitlistSchema.parse({
      patientId: VALID_UUID,
      notes: "  prefere manhã  ",
    })
    expect(parsed.notes).toBe("prefere manhã")

    const emptyNotes = enqueueWaitlistSchema.parse({
      patientId: VALID_UUID,
      notes: "   ",
    })
    expect(emptyNotes.notes).toBe(undefined)
  })

  it("rejects an invalid patientId", () => {
    const result = enqueueWaitlistSchema.safeParse({ patientId: "not-a-uuid" })
    expect(result.success).toBe(false)
  })
})

describe("cancelWaitlistSchema", () => {
  it("requires a valid id", () => {
    expect(cancelWaitlistSchema.safeParse({ id: VALID_UUID }).success).toBe(true)
    expect(cancelWaitlistSchema.safeParse({ id: "bad" }).success).toBe(false)
  })
})

describe("promoteWaitlistSchema", () => {
  it("validates waitlistId and the nested appointment payload", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = promoteWaitlistSchema.parse({
      waitlistId: VALID_UUID,
      appointment: {
        patientId: VALID_UUID,
        professionalId: OTHER_UUID,
        serviceId: VALID_UUID,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      },
    })
    expect(parsed.waitlistId).toBe(VALID_UUID)
    expect(parsed.appointment.modality).toBe("in_person")
  })

  it("rejects an invalid waitlistId", () => {
    const { startsAt, endsAt } = futureRange()
    const result = promoteWaitlistSchema.safeParse({
      waitlistId: "not-a-uuid",
      appointment: {
        patientId: VALID_UUID,
        professionalId: OTHER_UUID,
        serviceId: VALID_UUID,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      },
    })
    expect(result.success).toBe(false)
  })
})

describe("assertWaitlistPromotable", () => {
  it("returns the entry when it is waiting and the patient matches", () => {
    const entry = buildEntry()
    const result = assertWaitlistPromotable({
      entry,
      appointmentPatientId: entry.patientId,
    })
    expect(result).toBe(entry)
  })

  it("rejects a missing entry as not found", () => {
    try {
      assertWaitlistPromotable({
        entry: null,
        appointmentPatientId: VALID_UUID,
      })
      fail("expected NOT_FOUND")
    } catch (error) {
      expect(isAppError(error)).toBe(true)
      expect((error as AppError).code).toBe(ErrorCode.NOT_FOUND)
    }
  })

  it("rejects promoting an entry that is not waiting", () => {
    for (const status of ["promoted", "canceled"] as const) {
      const entry = buildEntry({ status })
      try {
        assertWaitlistPromotable({
          entry,
          appointmentPatientId: entry.patientId,
        })
        fail(`expected CONFLICT for status ${status}`)
      } catch (error) {
        expect(isAppError(error)).toBe(true)
        expect((error as AppError).code).toBe(ErrorCode.CONFLICT)
      }
    }
  })

  it("rejects promoting to a different patient", () => {
    const entry = buildEntry()
    try {
      assertWaitlistPromotable({
        entry,
        appointmentPatientId: OTHER_UUID,
      })
      fail("expected VALIDATION_FAILED")
    } catch (error) {
      expect(isAppError(error)).toBe(true)
      expect((error as AppError).code).toBe(ErrorCode.VALIDATION_FAILED)
    }
  })
})
