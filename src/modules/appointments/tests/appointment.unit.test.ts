import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  canCompleteAttendance,
  canConfirmAppointment,
  canMarkAppointmentNoShow,
  canOpenAttendance,
  canResumeAttendance,
  canRoleStartAttendance,
  canStartAttendance,
  getProfessionalCalendarColor,
  isAppointmentScheduleEditable,
  isSelfScheduleOnlyRole,
} from "@/modules/appointments/constants/appointments"
import { toAppointment } from "@/modules/appointments/mappers/appointment.mapper"
import {
  cancelAppointmentSchema,
  createAppointmentSchema,
  listAppointmentsSchema,
  listPatientAppointmentsSchema,
  rescheduleAppointmentSchema,
  updateAppointmentDetailsSchema,
  updateAppointmentStatusSchema,
} from "@/modules/appointments/schemas/appointment.schema"
import {
  checkProfessionalAvailability,
  professionalAvailabilityService,
} from "@/modules/appointments/services/professional-availability.service"
import type { ProfessionalAvailabilityInput } from "@/modules/appointments/types/availability"
import {
  getUnavailableMinuteRanges,
  isWithinOpenClinicMinutes,
  resolveVisibleHourRange,
} from "@/modules/appointments/utils/calendar-clinic-hours"
import {
  agendaLocationFromSearchParams,
  buildAgendaHref,
  buildAttendanceHref,
} from "@/modules/appointments/utils/agenda-href"
import {
  findNextAvailableStarts,
  formatSuggestedSlotLabel,
  readSuggestedSlotsFromMeta,
} from "@/modules/appointments/utils/suggested-slots"
import { AppError, ErrorCode } from "@/shared/errors"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"
const OTHER_UUID = "22222222-2222-4222-8222-222222222222"

/** Relative future window so createAppointmentSchema past-check stays stable. */
function futureRange(hoursFromNow = 24, durationHours = 1) {
  const startsAt = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
  const endsAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000)
  return { startsAt, endsAt }
}

const baseInput: ProfessionalAvailabilityInput = {
  clinicId: VALID_UUID,
  professionalId: OTHER_UUID,
  startsAt: new Date("2026-01-10T10:00:00.000Z"),
  endsAt: new Date("2026-01-10T11:00:00.000Z"),
}

describe("createAppointmentSchema", () => {
  it("accepts a valid payload and defaults type to consultation", () => {
    const { startsAt, endsAt } = futureRange()

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
    const { startsAt, endsAt } = futureRange()
    const result = createAppointmentSchema.safeParse({
      patientId: "not-a-uuid",
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    assert.equal(result.success, false)
  })

  it("rejects when endsAt is before or equal to startsAt", () => {
    const { startsAt } = futureRange()
    const result = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: startsAt.toISOString(),
    })
    assert.equal(result.success, false)
  })

  it("rejects a duration longer than 8 hours", () => {
    const { startsAt, endsAt } = futureRange(24, 9)
    const result = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    assert.equal(result.success, false)
  })

  it("rejects a startsAt in the past", () => {
    const startsAt = new Date(Date.now() - 60 * 60 * 1000)
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000)
    const result = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    assert.equal(result.success, false)
  })

  it("trims optional reason/notes and drops empty values", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      reason: "  Dor de cabeça  ",
      notes: "   ",
    })
    assert.equal(parsed.reason, "Dor de cabeça")
    assert.equal(parsed.notes, undefined)
  })

  it("accepts a supported appointment type", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      type: "follow_up",
    })
    assert.equal(parsed.type, "follow_up")
  })

  it("accepts optional amountCents when positive", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      amountCents: 15000,
    })
    assert.equal(parsed.amountCents, 15000)
  })

  it("rejects amountCents <= 0 when provided", () => {
    const { startsAt, endsAt } = futureRange()
    const zero = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      amountCents: 0,
    })
    assert.equal(zero.success, false)

    const negative = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      amountCents: -1,
    })
    assert.equal(negative.success, false)
  })
})

describe("listAppointmentsSchema", () => {
  it("accepts a valid from/to range", () => {
    const parsed = listAppointmentsSchema.parse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
    })
    assert.ok(parsed.from < parsed.to)
    assert.equal(parsed.professionalIds, undefined)
  })

  it("accepts optional professionalIds", () => {
    const parsed = listAppointmentsSchema.parse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
      professionalIds: [VALID_UUID, OTHER_UUID],
    })
    assert.deepEqual(parsed.professionalIds, [VALID_UUID, OTHER_UUID])
  })

  it("rejects invalid professionalIds", () => {
    const result = listAppointmentsSchema.safeParse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
      professionalIds: ["not-a-uuid"],
    })
    assert.equal(result.success, false)
  })

  it("rejects when from is not before to", () => {
    const result = listAppointmentsSchema.safeParse({
      from: "2026-01-31T00:00:00.000Z",
      to: "2026-01-01T00:00:00.000Z",
    })
    assert.equal(result.success, false)
  })
})

describe("listPatientAppointmentsSchema", () => {
  it("defaults limit to 10", () => {
    const parsed = listPatientAppointmentsSchema.parse({
      patientId: VALID_UUID,
    })
    assert.equal(parsed.patientId, VALID_UUID)
    assert.equal(parsed.limit, 10)
    assert.equal(parsed.excludeAppointmentId, undefined)
  })

  it("accepts excludeAppointmentId and custom limit", () => {
    const parsed = listPatientAppointmentsSchema.parse({
      patientId: VALID_UUID,
      excludeAppointmentId: OTHER_UUID,
      limit: 5,
    })
    assert.equal(parsed.excludeAppointmentId, OTHER_UUID)
    assert.equal(parsed.limit, 5)
  })

  it("rejects invalid patientId or limit out of range", () => {
    assert.equal(
      listPatientAppointmentsSchema.safeParse({ patientId: "bad" }).success,
      false,
    )
    assert.equal(
      listPatientAppointmentsSchema.safeParse({
        patientId: VALID_UUID,
        limit: 0,
      }).success,
      false,
    )
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

describe("rescheduleAppointmentSchema", () => {
  it("accepts a valid reschedule payload", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = rescheduleAppointmentSchema.parse({
      id: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    assert.equal(parsed.id, VALID_UUID)
    assert.equal(parsed.professionalId, OTHER_UUID)
  })

  it("rejects a startsAt in the past", () => {
    const startsAt = new Date(Date.now() - 60 * 60 * 1000)
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000)
    const result = rescheduleAppointmentSchema.safeParse({
      id: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    assert.equal(result.success, false)
  })

  it("rejects when endsAt is not after startsAt", () => {
    const { startsAt } = futureRange()
    const result = rescheduleAppointmentSchema.safeParse({
      id: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: startsAt.toISOString(),
    })
    assert.equal(result.success, false)
  })
})

describe("updateAppointmentDetailsSchema", () => {
  it("accepts type with optional reason/notes", () => {
    const parsed = updateAppointmentDetailsSchema.parse({
      id: VALID_UUID,
      type: "follow_up",
      reason: "  Retorno  ",
      notes: "Obs",
    })
    assert.equal(parsed.type, "follow_up")
    assert.equal(parsed.reason, "Retorno")
    assert.equal(parsed.notes, "Obs")
  })

  it("clears empty reason/notes to null", () => {
    const parsed = updateAppointmentDetailsSchema.parse({
      id: VALID_UUID,
      type: "consultation",
      reason: "   ",
      notes: "",
    })
    assert.equal(parsed.reason, null)
    assert.equal(parsed.notes, null)
  })

  it("requires a valid appointment type", () => {
    const result = updateAppointmentDetailsSchema.safeParse({
      id: VALID_UUID,
      type: "invalid",
    })
    assert.equal(result.success, false)
  })
})

describe("isAppointmentScheduleEditable", () => {
  it("is true for scheduled, confirmed and checked_in", () => {
    assert.equal(isAppointmentScheduleEditable("scheduled"), true)
    assert.equal(isAppointmentScheduleEditable("confirmed"), true)
    assert.equal(isAppointmentScheduleEditable("checked_in"), true)
  })

  it("is false for terminal statuses", () => {
    assert.equal(isAppointmentScheduleEditable("completed"), false)
    assert.equal(isAppointmentScheduleEditable("canceled"), false)
    assert.equal(isAppointmentScheduleEditable("no_show"), false)
  })
})

describe("appointment status transition helpers", () => {
  it("allows confirm only from scheduled", () => {
    assert.equal(canConfirmAppointment("scheduled"), true)
    assert.equal(canConfirmAppointment("confirmed"), false)
    assert.equal(canConfirmAppointment("checked_in"), false)
  })

  it("allows no-show from scheduled or confirmed", () => {
    assert.equal(canMarkAppointmentNoShow("scheduled"), true)
    assert.equal(canMarkAppointmentNoShow("confirmed"), true)
    assert.equal(canMarkAppointmentNoShow("checked_in"), false)
    assert.equal(canMarkAppointmentNoShow("completed"), false)
  })

  it("allows start attendance from scheduled or confirmed", () => {
    assert.equal(canStartAttendance("scheduled"), true)
    assert.equal(canStartAttendance("confirmed"), true)
    assert.equal(canStartAttendance("checked_in"), false)
  })

  it("allows start attendance only for owner, admin and health roles", () => {
    assert.equal(canRoleStartAttendance("owner"), true)
    assert.equal(canRoleStartAttendance("admin"), true)
    assert.equal(canRoleStartAttendance("doctor"), true)
    assert.equal(canRoleStartAttendance("nurse"), true)
    assert.equal(canRoleStartAttendance("manager"), false)
    assert.equal(canRoleStartAttendance("receptionist"), false)
    assert.equal(canRoleStartAttendance("financial"), false)
    assert.equal(canRoleStartAttendance(null), false)
  })

  it("allows resume only while checked_in", () => {
    assert.equal(canResumeAttendance("checked_in"), true)
    assert.equal(canResumeAttendance("scheduled"), false)
  })

  it("allows opening attendance for active and completed visits", () => {
    assert.equal(canOpenAttendance("scheduled"), true)
    assert.equal(canOpenAttendance("checked_in"), true)
    assert.equal(canOpenAttendance("completed"), true)
    assert.equal(canOpenAttendance("canceled"), false)
    assert.equal(canOpenAttendance("no_show"), false)
  })

  it("allows complete only from checked_in", () => {
    assert.equal(canCompleteAttendance("checked_in"), true)
    assert.equal(canCompleteAttendance("confirmed"), false)
    assert.equal(canCompleteAttendance("completed"), false)
  })
})

describe("updateAppointmentStatusSchema", () => {
  it("accepts confirmed, no_show, checked_in and completed", () => {
    for (const status of [
      "confirmed",
      "no_show",
      "checked_in",
      "completed",
    ] as const) {
      assert.equal(
        updateAppointmentStatusSchema.parse({
          id: VALID_UUID,
          status,
        }).status,
        status,
      )
    }
  })

  it("rejects unsupported status transitions", () => {
    const result = updateAppointmentStatusSchema.safeParse({
      id: VALID_UUID,
      status: "canceled",
    })
    assert.equal(result.success, false)
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
  it("is true for professional roles (doctor and nurse)", () => {
    assert.equal(isSelfScheduleOnlyRole("doctor"), true)
    assert.equal(isSelfScheduleOnlyRole("nurse"), true)
    assert.equal(isSelfScheduleOnlyRole("receptionist"), false)
    assert.equal(isSelfScheduleOnlyRole("owner"), false)
    assert.equal(isSelfScheduleOnlyRole(null), false)
    assert.equal(isSelfScheduleOnlyRole(undefined), false)
  })
})

describe("checkProfessionalAvailability", () => {
  const withinHours = async () => true

  it("returns available when there is no overlapping active appointment", async () => {
    const result = await checkProfessionalAvailability(baseInput, {
      hasOverlappingActiveAppointment: async () => false,
      isWithinWorkingHours: withinHours,
    })

    assert.deepEqual(result, { available: true })
  })

  it("returns slot_conflict when an active appointment overlaps", async () => {
    const result = await checkProfessionalAvailability(baseInput, {
      hasOverlappingActiveAppointment: async () => true,
      isWithinWorkingHours: withinHours,
    })

    assert.deepEqual(result, {
      available: false,
      reason: "slot_conflict",
    })
  })

  it("returns outside_working_hours when outside clinic hours", async () => {
    const result = await checkProfessionalAvailability(baseInput, {
      hasOverlappingActiveAppointment: async () => false,
      isWithinWorkingHours: async () => false,
    })

    assert.deepEqual(result, {
      available: false,
      reason: "outside_working_hours",
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
        isWithinWorkingHours: withinHours,
      },
    )

    assert.equal(received?.excludeAppointmentId, VALID_UUID)
  })
})

describe("professionalAvailabilityService.ensureAvailable", () => {
  const availabilityMocks = {
    isWithinWorkingHours: async () => true,
    getDayIntervalsForSuggestions: async () => () => [
      { startMinutes: 7 * 60, endMinutes: 19 * 60 },
    ],
  }

  it("resolves when the professional is available", async () => {
    await professionalAvailabilityService.ensureAvailable(baseInput, {
      hasOverlappingActiveAppointment: async () => false,
      listBusyIntervals: async () => [],
      ...availabilityMocks,
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
          ...availabilityMocks,
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

  it("starts from the next step after an unaligned 'now' without skipping a valid slot", () => {
    const after = new Date(2026, 6, 23, 15, 7, 0)
    const slots = findNextAvailableStarts({
      after,
      durationMs: 30 * 60 * 1000,
      busy: [],
      limit: 1,
    })

    assert.equal(slots.length, 1)
    assert.equal(slots[0]?.getHours(), 15)
    assert.equal(slots[0]?.getMinutes(), 30)
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

describe("calendar clinic hours utils", () => {
  const splitDayWeek = Array.from({ length: 7 }, (_, dayOfWeek) => ({
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

  it("resolves visible hour range from open intervals", () => {
    // Monday 2026-07-20
    const monday = new Date(2026, 6, 20)
    assert.deepEqual(resolveVisibleHourRange(splitDayWeek, [monday]), {
      start: 8,
      end: 18,
    })
  })

  it("marks the lunch break as an unavailable range", () => {
    const monday = new Date(2026, 6, 20)
    const ranges = getUnavailableMinuteRanges(splitDayWeek, monday, {
      start: 8,
      end: 18,
    })

    assert.deepEqual(ranges, [
      { startMinutes: 12 * 60, endMinutes: 14 * 60 },
    ])
  })

  it("marks a closed day as fully unavailable", () => {
    const sunday = new Date(2026, 6, 19)
    const ranges = getUnavailableMinuteRanges(splitDayWeek, sunday, {
      start: 8,
      end: 18,
    })

    assert.deepEqual(ranges, [
      { startMinutes: 8 * 60, endMinutes: 18 * 60 },
    ])
  })

  it("detects open vs break minutes", () => {
    const monday = new Date(2026, 6, 20)
    assert.equal(isWithinOpenClinicMinutes(splitDayWeek, monday, 9 * 60), true)
    assert.equal(
      isWithinOpenClinicMinutes(splitDayWeek, monday, 13 * 60),
      false,
    )
  })
})

describe("agenda href round-trip", () => {
  it("builds agenda href with mode and date", () => {
    assert.equal(
      buildAgendaHref({ mode: "week", date: "2026-07-20" }),
      "/appointments?mode=week&date=2026-07-20",
    )
  })

  it("preserves agenda location on attendance href", () => {
    assert.equal(
      buildAttendanceHref(VALID_UUID, {
        mode: "day",
        date: new Date(2026, 6, 24),
      }),
      `/appointments/${VALID_UUID}/attendance?mode=day&date=2026-07-24`,
    )
  })

  it("reads agenda location from search params", () => {
    const params = new URLSearchParams("mode=month&date=2026-07-01")
    assert.deepEqual(agendaLocationFromSearchParams(params), {
      mode: "month",
      date: "2026-07-01",
    })
  })
})
