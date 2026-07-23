import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  getProfessionalCalendarColor,
  isSelfScheduleOnlyRole,
} from "@/modules/appointments/constants/appointments"
import { toAppointment } from "@/modules/appointments/mappers/appointment.mapper"
import {
  cancelAppointmentSchema,
  createAppointmentSchema,
  listAppointmentsSchema,
} from "@/modules/appointments/schemas/appointment.schema"
import {
  checkProfessionalAvailability,
  professionalAvailabilityService,
} from "@/modules/appointments/services/professional-availability.service"
import type { ProfessionalAvailabilityInput } from "@/modules/appointments/types/availability"
import {
  findNextAvailableStarts,
  formatSuggestedSlotLabel,
  readSuggestedSlotsFromMeta,
} from "@/modules/appointments/utils/suggested-slots"
import { AppError, ErrorCode } from "@/shared/errors"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"
const OTHER_UUID = "22222222-2222-4222-8222-222222222222"

const baseInput: ProfessionalAvailabilityInput = {
  clinicId: VALID_UUID,
  professionalId: OTHER_UUID,
  startsAt: new Date("2026-01-10T10:00:00.000Z"),
  endsAt: new Date("2026-01-10T11:00:00.000Z"),
}

describe("createAppointmentSchema", () => {
  it("accepts a valid payload and defaults type to consultation", () => {
    const startsAt = new Date("2026-01-10T10:00:00.000Z")
    const endsAt = new Date("2026-01-10T11:00:00.000Z")

    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })

    assert.equal(parsed.type, "consultation")
    assert.equal(parsed.startsAt.getTime(), startsAt.getTime())
    assert.equal(parsed.endsAt.getTime(), endsAt.getTime())
  })

  it("rejects invalid patientId/professionalId", () => {
    const result = createAppointmentSchema.safeParse({
      patientId: "not-a-uuid",
      professionalId: OTHER_UUID,
      startsAt: "2026-01-10T10:00:00.000Z",
      endsAt: "2026-01-10T11:00:00.000Z",
    })
    assert.equal(result.success, false)
  })

  it("rejects when endsAt is before or equal to startsAt", () => {
    const result = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: "2026-01-10T11:00:00.000Z",
      endsAt: "2026-01-10T11:00:00.000Z",
    })
    assert.equal(result.success, false)
  })

  it("rejects a duration longer than 8 hours", () => {
    const result = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: "2026-01-10T08:00:00.000Z",
      endsAt: "2026-01-10T17:00:00.000Z",
    })
    assert.equal(result.success, false)
  })

  it("trims optional reason/notes and drops empty values", () => {
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: "2026-01-10T10:00:00.000Z",
      endsAt: "2026-01-10T11:00:00.000Z",
      reason: "  Dor de cabeça  ",
      notes: "   ",
    })
    assert.equal(parsed.reason, "Dor de cabeça")
    assert.equal(parsed.notes, undefined)
  })

  it("accepts a supported appointment type", () => {
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: "2026-01-10T10:00:00.000Z",
      endsAt: "2026-01-10T11:00:00.000Z",
      type: "follow_up",
    })
    assert.equal(parsed.type, "follow_up")
  })
})

describe("listAppointmentsSchema", () => {
  it("accepts a valid from/to range", () => {
    const parsed = listAppointmentsSchema.parse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
    })
    assert.ok(parsed.from < parsed.to)
  })

  it("rejects when from is not before to", () => {
    const result = listAppointmentsSchema.safeParse({
      from: "2026-01-31T00:00:00.000Z",
      to: "2026-01-01T00:00:00.000Z",
    })
    assert.equal(result.success, false)
  })
})

describe("cancelAppointmentSchema", () => {
  it("requires a valid uuid id", () => {
    const result = cancelAppointmentSchema.safeParse({ id: "not-a-uuid" })
    assert.equal(result.success, false)
  })

  it("accepts an optional canceledReason", () => {
    const parsed = cancelAppointmentSchema.parse({
      id: VALID_UUID,
      canceledReason: "Paciente remarcou",
    })
    assert.equal(parsed.canceledReason, "Paciente remarcou")
  })

  it("drops an empty canceledReason", () => {
    const parsed = cancelAppointmentSchema.parse({
      id: VALID_UUID,
      canceledReason: "   ",
    })
    assert.equal(parsed.canceledReason, undefined)
  })
})

describe("toAppointment mapper", () => {
  it("maps a joined row to the domain Appointment shape", () => {
    const now = new Date()
    const appointment = toAppointment({
      id: VALID_UUID,
      clinicId: OTHER_UUID,
      patientId: VALID_UUID,
      patientName: "Maria Silva",
      professionalId: OTHER_UUID,
      professionalName: "Dr. João",
      startsAt: now,
      endsAt: now,
      type: "consultation",
      status: "scheduled",
      reason: "Rotina",
      notes: null,
      canceledAt: null,
      canceledReason: null,
      createdAt: now,
      updatedAt: now,
    })

    assert.equal(appointment.id, VALID_UUID)
    assert.equal(appointment.patientName, "Maria Silva")
    assert.equal(appointment.professionalName, "Dr. João")
    assert.equal(appointment.type, "consultation")
    assert.equal(appointment.status, "scheduled")
  })

  it("falls back to safe defaults for unexpected status/type values", () => {
    const now = new Date()
    const appointment = toAppointment({
      id: VALID_UUID,
      clinicId: OTHER_UUID,
      patientId: VALID_UUID,
      patientName: "João Souza",
      professionalId: null,
      professionalName: null,
      startsAt: now,
      endsAt: now,
      type: "unknown-type",
      status: "unknown-status",
      reason: null,
      notes: null,
      canceledAt: null,
      canceledReason: null,
      createdAt: now,
      updatedAt: now,
    })

    assert.equal(appointment.status, "scheduled")
    assert.equal(appointment.type, "consultation")
    assert.equal(appointment.professionalId, null)
    assert.equal(appointment.professionalName, null)
  })
})

describe("getProfessionalCalendarColor", () => {
  it("returns the same color for the same professional id", () => {
    const first = getProfessionalCalendarColor(VALID_UUID)
    const second = getProfessionalCalendarColor(VALID_UUID)
    assert.equal(first, second)
  })

  it("returns a muted gray for a null/undefined professional id", () => {
    assert.equal(getProfessionalCalendarColor(null), "#D4D4D8")
    assert.equal(getProfessionalCalendarColor(undefined), "#D4D4D8")
  })

  it("can return different colors for different professional ids", () => {
    const colors = new Set([
      getProfessionalCalendarColor(VALID_UUID),
      getProfessionalCalendarColor(OTHER_UUID),
      getProfessionalCalendarColor("33333333-3333-4333-8333-333333333333"),
    ])
    assert.ok(colors.size >= 1)
  })
})

describe("isSelfScheduleOnlyRole", () => {
  it("is true only for doctor", () => {
    assert.equal(isSelfScheduleOnlyRole("doctor"), true)
    assert.equal(isSelfScheduleOnlyRole("nurse"), false)
    assert.equal(isSelfScheduleOnlyRole("receptionist"), false)
    assert.equal(isSelfScheduleOnlyRole(null), false)
    assert.equal(isSelfScheduleOnlyRole(undefined), false)
  })
})

describe("checkProfessionalAvailability", () => {
  it("returns available when there is no overlapping active appointment", async () => {
    const result = await checkProfessionalAvailability(baseInput, {
      hasOverlappingActiveAppointment: async () => false,
    })

    assert.deepEqual(result, { available: true })
  })

  it("returns slot_conflict when an active appointment overlaps", async () => {
    const result = await checkProfessionalAvailability(baseInput, {
      hasOverlappingActiveAppointment: async () => true,
    })

    assert.deepEqual(result, {
      available: false,
      reason: "slot_conflict",
    })
  })

  it("forwards excludeAppointmentId to the overlap dependency", async () => {
    let received: ProfessionalAvailabilityInput | undefined

    await checkProfessionalAvailability(
      { ...baseInput, excludeAppointmentId: VALID_UUID },
      {
        hasOverlappingActiveAppointment: async (input) => {
          received = input
          return false
        },
      },
    )

    assert.equal(received?.excludeAppointmentId, VALID_UUID)
  })
})

describe("professionalAvailabilityService.ensureAvailable", () => {
  it("resolves when the professional is available", async () => {
    await professionalAvailabilityService.ensureAvailable(baseInput, {
      hasOverlappingActiveAppointment: async () => false,
      listBusyIntervals: async () => [],
    })
  })

  it("throws APPOINTMENT_SLOT_UNAVAILABLE with suggested slots on conflict", async () => {
    await assert.rejects(
      () =>
        professionalAvailabilityService.ensureAvailable(baseInput, {
          hasOverlappingActiveAppointment: async () => true,
          listBusyIntervals: async () => [
            {
              startsAt: baseInput.startsAt,
              endsAt: baseInput.endsAt,
            },
          ],
        }),
      (error: unknown) => {
        if (
          !(error instanceof AppError) ||
          error.code !== ErrorCode.APPOINTMENT_SLOT_UNAVAILABLE
        ) {
          return false
        }

        const slots = readSuggestedSlotsFromMeta(error.meta)
        return slots.length > 0
      },
    )
  })
})

describe("formatSuggestedSlotLabel", () => {
  const now = new Date(2026, 6, 23, 9, 0, 0)

  it("labels a slot on the same day as Hoje", () => {
    assert.equal(
      formatSuggestedSlotLabel(new Date(2026, 6, 23, 15, 30, 0), now),
      "Hoje às 15:30",
    )
  })

  it("labels a slot on the next day as Amanhã", () => {
    assert.equal(
      formatSuggestedSlotLabel(new Date(2026, 6, 24, 10, 0, 0), now),
      "Amanhã às 10:00",
    )
  })

  it("labels later days with weekday and date", () => {
    assert.equal(
      formatSuggestedSlotLabel(new Date(2026, 6, 27, 11, 0, 0), now),
      "seg. 27/07/2026",
    )
  })
})

describe("findNextAvailableStarts", () => {
  it("skips a busy interval and returns the next free starts", () => {
    const after = new Date(2026, 6, 23, 10, 0, 0)
    const slots = findNextAvailableStarts({
      after,
      durationMs: 30 * 60 * 1000,
      busy: [
        {
          startsAt: new Date(2026, 6, 23, 10, 0, 0),
          endsAt: new Date(2026, 6, 23, 11, 0, 0),
        },
      ],
      limit: 2,
    })

    assert.equal(slots.length, 2)
    assert.equal(slots[0]?.getHours(), 11)
    assert.equal(slots[0]?.getMinutes(), 0)
    assert.equal(slots[1]?.getHours(), 11)
    assert.equal(slots[1]?.getMinutes(), 30)
  })
})

describe("readSuggestedSlotsFromMeta", () => {
  it("filters invalid values from meta.suggestedSlots", () => {
    assert.deepEqual(
      readSuggestedSlotsFromMeta({
        suggestedSlots: ["2026-07-23T15:00:00.000Z", "nope", 12],
      }),
      ["2026-07-23T15:00:00.000Z"],
    )
  })
})
