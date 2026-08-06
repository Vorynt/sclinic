import assert from "node:assert/strict"
import { describe, it } from "node:test"

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

describe("enqueueWaitlistSchema", () => {
  it("requires a valid patientId and allows optional fields to be omitted", () => {
    const parsed = enqueueWaitlistSchema.parse({ patientId: VALID_UUID })
    assert.equal(parsed.patientId, VALID_UUID)
    assert.equal(parsed.professionalId, undefined)
    assert.equal(parsed.serviceId, undefined)
  })

  it("trims notes and drops empty strings", () => {
    const parsed = enqueueWaitlistSchema.parse({
      patientId: VALID_UUID,
      notes: "  prefere manhã  ",
    })
    assert.equal(parsed.notes, "prefere manhã")

    const emptyNotes = enqueueWaitlistSchema.parse({
      patientId: VALID_UUID,
      notes: "   ",
    })
    assert.equal(emptyNotes.notes, undefined)
  })

  it("rejects an invalid patientId", () => {
    const result = enqueueWaitlistSchema.safeParse({ patientId: "not-a-uuid" })
    assert.equal(result.success, false)
  })
})

describe("cancelWaitlistSchema", () => {
  it("requires a valid id", () => {
    assert.equal(
      cancelWaitlistSchema.safeParse({ id: VALID_UUID }).success,
      true,
    )
    assert.equal(cancelWaitlistSchema.safeParse({ id: "bad" }).success, false)
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
    assert.equal(parsed.waitlistId, VALID_UUID)
    assert.equal(parsed.appointment.modality, "in_person")
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
    assert.equal(result.success, false)
  })
})

describe("assertWaitlistPromotable", () => {
  it("returns the entry when it is waiting and the patient matches", () => {
    const entry = buildEntry()
    const result = assertWaitlistPromotable({
      entry,
      appointmentPatientId: entry.patientId,
    })
    assert.equal(result, entry)
  })

  it("rejects a missing entry as not found", () => {
    try {
      assertWaitlistPromotable({
        entry: null,
        appointmentPatientId: VALID_UUID,
      })
      assert.fail("expected NOT_FOUND")
    } catch (error) {
      assert.equal(isAppError(error), true)
      assert.equal((error as AppError).code, ErrorCode.NOT_FOUND)
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
        assert.fail(`expected CONFLICT for status ${status}`)
      } catch (error) {
        assert.equal(isAppError(error), true)
        assert.equal((error as AppError).code, ErrorCode.CONFLICT)
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
      assert.fail("expected VALIDATION_FAILED")
    } catch (error) {
      assert.equal(isAppError(error), true)
      assert.equal((error as AppError).code, ErrorCode.VALIDATION_FAILED)
    }
  })
})
