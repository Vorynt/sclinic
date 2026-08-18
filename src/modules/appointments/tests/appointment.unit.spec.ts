import { describe, expect, it } from "@jest/globals"

import {
  canCompleteAttendance,
  canConfirmAppointment,
  canMarkAppointmentNoShow,
  canOpenAttendance,
  canPerformThisAttendance,
  canResumeAttendance,
  canRoleStartAttendance,
  canShowAttendanceAction,
  canStartAttendance,
  canViewAttendance,
  COMPLETE_ATTENDANCE_DENIED_TOOLTIP,
  getAttendanceActionDeniedTooltip,
  getAttendanceActionLabel,
  getProfessionalCalendarColor,
  isAppointmentConfirmableInBatch,
  isAppointmentScheduleEditable,
  isAssignedProfessional,
  isSelfScheduleOnlyRole,
} from "@/modules/appointments/constants/appointments"
import { isAttendancePanel } from "@/modules/appointments/constants/attendance-panels"
import { toAppointment } from "@/modules/appointments/mappers/appointment.mapper"
import {
  cancelAppointmentSchema,
  confirmAppointmentsBatchSchema,
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
  attendancePanelFromSearchParams,
  buildAgendaHref,
  buildAttendanceHref,
  buildAttendanceRedirectHref,
} from "@/modules/appointments/utils/agenda-href"
import {
  getAppointmentDurationMinutes,
  rangesOverlap,
} from "@/modules/appointments/utils/appointment-time"
import {
  appointmentNewLocationFromSearchParams,
  buildAppointmentNewHref,
} from "@/modules/appointments/utils/appointment-new-href"
import {
  getEffectiveMinuteIntervals,
  intersectMinuteIntervals,
  isWithinEffectiveHours,
} from "@/modules/appointments/utils/effective-working-hours"
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
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })

    expect(parsed.type).toBe("consultation")
    expect(parsed.startsAt.getTime()).toBe(startsAt.getTime())
    expect(parsed.endsAt.getTime()).toBe(endsAt.getTime())
  })

  it("rejects invalid patientId/professionalId", () => {
    const { startsAt, endsAt } = futureRange()
    const result = createAppointmentSchema.safeParse({
      patientId: "not-a-uuid",
      professionalId: OTHER_UUID,
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it("rejects when endsAt is before or equal to startsAt", () => {
    const { startsAt } = futureRange()
    const result = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: startsAt.toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it("rejects a duration longer than 8 hours", () => {
    const { startsAt, endsAt } = futureRange(24, 9)
    const result = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it("rejects a startsAt in the past", () => {
    const startsAt = new Date(Date.now() - 60 * 60 * 1000)
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000)
    const result = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it("trims optional reason/notes and drops empty values", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      reason: "  Dor de cabeça  ",
      notes: "   ",
    })
    expect(parsed.reason).toBe("Dor de cabeça")
    expect(parsed.notes).toBe(undefined)
  })

  it("accepts a supported appointment type", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      type: "follow_up",
    })
    expect(parsed.type).toBe("follow_up")
  })

  it("requires serviceId", () => {
    const { startsAt, endsAt } = futureRange()
    const missing = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    expect(missing.success).toBe(false)
  })

  it("accepts catalog pricing fields", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      serviceId: VALID_UUID,
      discountPercent: 10,
      billingKind: "courtesy",
    })
    expect(parsed.serviceId).toBe(VALID_UUID)
    expect(parsed.discountPercent).toBe(10)
    expect(parsed.billingKind).toBe("courtesy")
  })

  it("defaults modality to in_person", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
    expect(parsed.modality).toBe("in_person")
  })

  it("accepts the online modality and rejects unsupported values", () => {
    const { startsAt, endsAt } = futureRange()
    const parsed = createAppointmentSchema.parse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      modality: "online",
    })
    expect(parsed.modality).toBe("online")

    const invalid = createAppointmentSchema.safeParse({
      patientId: VALID_UUID,
      professionalId: OTHER_UUID,
      serviceId: VALID_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      modality: "phone",
    })
    expect(invalid.success).toBe(false)
  })
})

describe("confirmAppointmentsBatchSchema", () => {
  it("accepts between 1 and 100 appointment ids", () => {
    const parsed = confirmAppointmentsBatchSchema.parse({
      appointmentIds: [VALID_UUID, OTHER_UUID],
    })
    expect(parsed.appointmentIds).toEqual([VALID_UUID, OTHER_UUID])
  })

  it("rejects an empty list", () => {
    const result = confirmAppointmentsBatchSchema.safeParse({
      appointmentIds: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects more than 100 ids", () => {
    const result = confirmAppointmentsBatchSchema.safeParse({
      appointmentIds: Array.from({ length: 101 }, () => VALID_UUID),
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid uuids", () => {
    const result = confirmAppointmentsBatchSchema.safeParse({
      appointmentIds: ["not-a-uuid"],
    })
    expect(result.success).toBe(false)
  })
})

describe("listAppointmentsSchema", () => {
  it("accepts a valid from/to range", () => {
    const parsed = listAppointmentsSchema.parse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
    })
    expect(parsed.from < parsed.to).toBeTruthy()
    expect(parsed.professionalIds).toBe(undefined)
  })

  it("accepts optional professionalIds", () => {
    const parsed = listAppointmentsSchema.parse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
      professionalIds: [VALID_UUID, OTHER_UUID],
    })
    expect(parsed.professionalIds).toEqual([VALID_UUID, OTHER_UUID])
  })

  it("rejects invalid professionalIds", () => {
    const result = listAppointmentsSchema.safeParse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
      professionalIds: ["not-a-uuid"],
    })
    expect(result.success).toBe(false)
  })

  it("rejects when from is not before to", () => {
    const result = listAppointmentsSchema.safeParse({
      from: "2026-01-31T00:00:00.000Z",
      to: "2026-01-01T00:00:00.000Z",
    })
    expect(result.success).toBe(false)
  })

  it("accepts an optional modality filter", () => {
    const parsed = listAppointmentsSchema.parse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
      modality: "online",
    })
    expect(parsed.modality).toBe("online")
  })

  it("accepts optional patientIds", () => {
    const parsed = listAppointmentsSchema.parse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
      patientIds: [VALID_UUID, OTHER_UUID],
    })
    expect(parsed.patientIds).toEqual([VALID_UUID, OTHER_UUID])
  })

  it("rejects invalid patientIds", () => {
    const result = listAppointmentsSchema.safeParse({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.000Z",
      patientIds: ["not-a-uuid"],
    })
    expect(result.success).toBe(false)
  })
})

describe("listPatientAppointmentsSchema", () => {
  it("defaults limit to 10", () => {
    const parsed = listPatientAppointmentsSchema.parse({
      patientId: VALID_UUID,
    })
    expect(parsed.patientId).toBe(VALID_UUID)
    expect(parsed.limit).toBe(10)
    expect(parsed.excludeAppointmentId).toBe(undefined)
  })

  it("accepts excludeAppointmentId and custom limit", () => {
    const parsed = listPatientAppointmentsSchema.parse({
      patientId: VALID_UUID,
      excludeAppointmentId: OTHER_UUID,
      limit: 5,
    })
    expect(parsed.excludeAppointmentId).toBe(OTHER_UUID)
    expect(parsed.limit).toBe(5)
  })

  it("rejects invalid patientId or limit out of range", () => {
    expect(listPatientAppointmentsSchema.safeParse({ patientId: "bad" }).success).toBe(false)
    expect(listPatientAppointmentsSchema.safeParse({
        patientId: VALID_UUID,
        limit: 0,
      }).success).toBe(false)
  })
})

describe("cancelAppointmentSchema", () => {
  it("requires a valid uuid id", () => {
    const result = cancelAppointmentSchema.safeParse({ id: "not-a-uuid" })
    expect(result.success).toBe(false)
  })

  it("accepts an optional canceledReason", () => {
    const parsed = cancelAppointmentSchema.parse({
      id: VALID_UUID,
      canceledReason: "Paciente remarcou",
    })
    expect(parsed.canceledReason).toBe("Paciente remarcou")
  })

  it("drops an empty canceledReason", () => {
    const parsed = cancelAppointmentSchema.parse({
      id: VALID_UUID,
      canceledReason: "   ",
    })
    expect(parsed.canceledReason).toBe(undefined)
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
    expect(parsed.id).toBe(VALID_UUID)
    expect(parsed.professionalId).toBe(OTHER_UUID)
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
    expect(result.success).toBe(false)
  })

  it("rejects when endsAt is not after startsAt", () => {
    const { startsAt } = futureRange()
    const result = rescheduleAppointmentSchema.safeParse({
      id: VALID_UUID,
      professionalId: OTHER_UUID,
      startsAt: startsAt.toISOString(),
      endsAt: startsAt.toISOString(),
    })
    expect(result.success).toBe(false)
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
    expect(parsed.type).toBe("follow_up")
    expect(parsed.reason).toBe("Retorno")
    expect(parsed.notes).toBe("Obs")
  })

  it("clears empty reason/notes to null", () => {
    const parsed = updateAppointmentDetailsSchema.parse({
      id: VALID_UUID,
      type: "consultation",
      reason: "   ",
      notes: "",
    })
    expect(parsed.reason).toBe(null)
    expect(parsed.notes).toBe(null)
  })

  it("requires a valid appointment type", () => {
    const result = updateAppointmentDetailsSchema.safeParse({
      id: VALID_UUID,
      type: "invalid",
    })
    expect(result.success).toBe(false)
  })
})

describe("isAppointmentScheduleEditable", () => {
  it("is true for scheduled, confirmed and checked_in", () => {
    expect(isAppointmentScheduleEditable("scheduled")).toBe(true)
    expect(isAppointmentScheduleEditable("confirmed")).toBe(true)
    expect(isAppointmentScheduleEditable("checked_in")).toBe(true)
  })

  it("is false for terminal statuses", () => {
    expect(isAppointmentScheduleEditable("completed")).toBe(false)
    expect(isAppointmentScheduleEditable("canceled")).toBe(false)
    expect(isAppointmentScheduleEditable("no_show")).toBe(false)
  })
})

describe("appointment status transition helpers", () => {
  it("allows confirm only from scheduled", () => {
    expect(canConfirmAppointment("scheduled")).toBe(true)
    expect(canConfirmAppointment("confirmed")).toBe(false)
    expect(canConfirmAppointment("checked_in")).toBe(false)
  })

  it("allows no-show from scheduled or confirmed", () => {
    expect(canMarkAppointmentNoShow("scheduled")).toBe(true)
    expect(canMarkAppointmentNoShow("confirmed")).toBe(true)
    expect(canMarkAppointmentNoShow("checked_in")).toBe(false)
    expect(canMarkAppointmentNoShow("completed")).toBe(false)
  })

  it("allows start attendance from scheduled or confirmed", () => {
    expect(canStartAttendance("scheduled")).toBe(true)
    expect(canStartAttendance("confirmed")).toBe(true)
    expect(canStartAttendance("checked_in")).toBe(false)
  })

  it("allows start attendance only for owner, admin and health roles", () => {
    expect(canRoleStartAttendance("owner")).toBe(true)
    expect(canRoleStartAttendance("admin")).toBe(true)
    expect(canRoleStartAttendance("clinician")).toBe(true)
    expect(canRoleStartAttendance("nurse")).toBe(true)
    expect(canRoleStartAttendance("manager")).toBe(false)
    expect(canRoleStartAttendance("receptionist")).toBe(false)
    expect(canRoleStartAttendance("financial")).toBe(false)
    expect(canRoleStartAttendance(null)).toBe(false)
  })

  it("treats assigned professional as matching own clinical profile", () => {
    expect(
      isAssignedProfessional({
        appointmentProfessionalId: VALID_UUID,
        ownProfessionalId: VALID_UUID,
      }),
    ).toBe(true)
    expect(
      isAssignedProfessional({
        appointmentProfessionalId: VALID_UUID,
        ownProfessionalId: OTHER_UUID,
      }),
    ).toBe(false)
    expect(
      isAssignedProfessional({
        appointmentProfessionalId: VALID_UUID,
        ownProfessionalId: null,
      }),
    ).toBe(false)
    expect(
      isAssignedProfessional({
        appointmentProfessionalId: null,
        ownProfessionalId: VALID_UUID,
      }),
    ).toBe(false)
  })

  it("allows performing attendance only for the assigned professional", () => {
    expect(
      canPerformThisAttendance({
        roleKey: "clinician",
        appointmentProfessionalId: VALID_UUID,
        ownProfessionalId: VALID_UUID,
      }),
    ).toBe(true)
    expect(
      canPerformThisAttendance({
        roleKey: "owner",
        appointmentProfessionalId: VALID_UUID,
        ownProfessionalId: VALID_UUID,
      }),
    ).toBe(true)
    expect(
      canPerformThisAttendance({
        roleKey: "admin",
        appointmentProfessionalId: VALID_UUID,
        ownProfessionalId: VALID_UUID,
      }),
    ).toBe(true)
    expect(
      canPerformThisAttendance({
        roleKey: "owner",
        appointmentProfessionalId: VALID_UUID,
        ownProfessionalId: OTHER_UUID,
      }),
    ).toBe(false)
    expect(
      canPerformThisAttendance({
        roleKey: "admin",
        appointmentProfessionalId: VALID_UUID,
        ownProfessionalId: null,
      }),
    ).toBe(false)
    expect(
      canPerformThisAttendance({
        roleKey: "manager",
        appointmentProfessionalId: VALID_UUID,
        ownProfessionalId: VALID_UUID,
      }),
    ).toBe(false)
    expect(
      canPerformThisAttendance({
        roleKey: "clinician",
        appointmentProfessionalId: OTHER_UUID,
        ownProfessionalId: VALID_UUID,
      }),
    ).toBe(false)
  })

  it("allows resume only while checked_in", () => {
    expect(canResumeAttendance("checked_in")).toBe(true)
    expect(canResumeAttendance("scheduled")).toBe(false)
  })

  it("allows opening attendance for active and completed visits", () => {
    expect(canOpenAttendance("scheduled")).toBe(true)
    expect(canOpenAttendance("checked_in")).toBe(true)
    expect(canOpenAttendance("completed")).toBe(true)
    expect(canOpenAttendance("canceled")).toBe(false)
    expect(canOpenAttendance("no_show")).toBe(false)
  })

  it("allows viewing attendance only while in progress or completed", () => {
    expect(canViewAttendance("checked_in")).toBe(true)
    expect(canViewAttendance("completed")).toBe(true)
    expect(canViewAttendance("scheduled")).toBe(false)
    expect(canViewAttendance("confirmed")).toBe(false)
  })

  it("hides open/view attendance without records.read", () => {
    expect(
      canShowAttendanceAction({
        status: "checked_in",
        canStartThis: false,
        canReadRecords: false,
      }),
    ).toBe(false)
    expect(
      canShowAttendanceAction({
        status: "completed",
        canStartThis: false,
        canReadRecords: false,
      }),
    ).toBe(false)
    expect(
      canShowAttendanceAction({
        status: "completed",
        canStartThis: false,
        canReadRecords: true,
      }),
    ).toBe(true)
    expect(
      canShowAttendanceAction({
        status: "scheduled",
        canStartThis: true,
        canReadRecords: false,
      }),
    ).toBe(true)
  })

  it("hides start on someone else's scheduled visit but keeps view when in progress", () => {
    expect(
      canShowAttendanceAction({
        status: "scheduled",
        canStartThis: false,
        canReadRecords: true,
      }),
    ).toBe(false)
    expect(
      canShowAttendanceAction({
        status: "checked_in",
        canStartThis: false,
        canReadRecords: true,
      }),
    ).toBe(true)
  })

  it("labels the attendance action by status", () => {
    expect(getAttendanceActionLabel("scheduled")).toBe("Iniciar atendimento")
    expect(getAttendanceActionLabel("confirmed")).toBe("Iniciar atendimento")
    expect(getAttendanceActionLabel("checked_in")).toBe("Abrir atendimento")
    expect(getAttendanceActionLabel("completed")).toBe("Ver atendimento")
  })

  it("explains denied start vs view in the tooltip", () => {
    expect(getAttendanceActionDeniedTooltip("scheduled")).toBe(
      "Você não pode iniciar este atendimento.",
    )
    expect(getAttendanceActionDeniedTooltip("confirmed")).toBe(
      "Você não pode iniciar este atendimento.",
    )
    expect(getAttendanceActionDeniedTooltip("checked_in")).toBe(
      "Você não pode ver este atendimento.",
    )
    expect(getAttendanceActionDeniedTooltip("completed")).toBe(
      "Você não pode ver este atendimento.",
    )
    expect(COMPLETE_ATTENDANCE_DENIED_TOOLTIP).toBe(
      "Você não pode concluir este atendimento.",
    )
  })

  it("allows complete only from checked_in", () => {
    expect(canCompleteAttendance("checked_in")).toBe(true)
    expect(canCompleteAttendance("confirmed")).toBe(false)
    expect(canCompleteAttendance("completed")).toBe(false)
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
      expect(updateAppointmentStatusSchema.parse({
          id: VALID_UUID,
          status,
        }).status).toBe(status)
    }
  })

  it("rejects unsupported status transitions", () => {
    const result = updateAppointmentStatusSchema.safeParse({
      id: VALID_UUID,
      status: "canceled",
    })
    expect(result.success).toBe(false)
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
      serviceId: VALID_UUID,
      startsAt: now,
      endsAt: now,
      type: "consultation",
      modality: "in_person",
      status: "scheduled",
      reason: "Rotina",
      notes: null,
      canceledAt: null,
      canceledReason: null,
      createdAt: now,
      updatedAt: now,
    })

    expect(appointment.id).toBe(VALID_UUID)
    expect(appointment.patientName).toBe("Maria Silva")
    expect(appointment.professionalName).toBe("Dr. João")
    expect(appointment.type).toBe("consultation")
    expect(appointment.status).toBe("scheduled")
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
      serviceId: null,
      startsAt: now,
      endsAt: now,
      type: "unknown-type",
      modality: "unknown-modality",
      status: "unknown-status",
      reason: null,
      notes: null,
      canceledAt: null,
      canceledReason: null,
      createdAt: now,
      updatedAt: now,
    })

    expect(appointment.status).toBe("scheduled")
    expect(appointment.type).toBe("consultation")
    expect(appointment.modality).toBe("in_person")
    expect(appointment.professionalId).toBe(null)
    expect(appointment.professionalName).toBe(null)
  })

  it("maps the online modality and defaults unknown values to in_person", () => {
    const now = new Date()
    const baseRow = {
      id: VALID_UUID,
      clinicId: OTHER_UUID,
      patientId: VALID_UUID,
      patientName: "Maria Silva",
      professionalId: OTHER_UUID,
      professionalName: "Dr. João",
      serviceId: VALID_UUID,
      startsAt: now,
      endsAt: now,
      type: "consultation",
      status: "scheduled",
      reason: null,
      notes: null,
      canceledAt: null,
      canceledReason: null,
      createdAt: now,
      updatedAt: now,
    }

    expect(toAppointment({ ...baseRow, modality: "online" }).modality).toBe("online")
    expect(toAppointment({ ...baseRow, modality: "something-else" }).modality).toBe("in_person")
  })
})

describe("getProfessionalCalendarColor", () => {
  it("returns the same color for the same professional id", () => {
    const first = getProfessionalCalendarColor(VALID_UUID)
    const second = getProfessionalCalendarColor(VALID_UUID)
    expect(first).toBe(second)
  })

  it("returns a muted gray for a null/undefined professional id", () => {
    expect(getProfessionalCalendarColor(null)).toBe("#D4D4D8")
    expect(getProfessionalCalendarColor(undefined)).toBe("#D4D4D8")
  })

  it("can return different colors for different professional ids", () => {
    const colors = new Set([
      getProfessionalCalendarColor(VALID_UUID),
      getProfessionalCalendarColor(OTHER_UUID),
      getProfessionalCalendarColor("33333333-3333-4333-8333-333333333333"),
    ])
    expect(colors.size >= 1).toBeTruthy()
  })
})

describe("isSelfScheduleOnlyRole", () => {
  it("is true for professional roles (doctor and nurse)", () => {
    expect(isSelfScheduleOnlyRole("clinician")).toBe(true)
    expect(isSelfScheduleOnlyRole("nurse")).toBe(true)
    expect(isSelfScheduleOnlyRole("receptionist")).toBe(false)
    expect(isSelfScheduleOnlyRole("owner")).toBe(false)
    expect(isSelfScheduleOnlyRole(null)).toBe(false)
    expect(isSelfScheduleOnlyRole(undefined)).toBe(false)
  })
})

describe("checkProfessionalAvailability", () => {
  const withinHours = async () => true

  it("returns available when there is no overlapping active appointment", async () => {
    const result = await checkProfessionalAvailability(baseInput, {
      hasOverlappingActiveAppointment: async () => false,
      hasOverlappingScheduleBlock: async () => false,
      isWithinWorkingHours: withinHours,
    })

    expect(result).toEqual({ available: true })
  })

  it("returns slot_conflict when an active appointment overlaps", async () => {
    const result = await checkProfessionalAvailability(baseInput, {
      hasOverlappingActiveAppointment: async () => true,
      hasOverlappingScheduleBlock: async () => false,
      isWithinWorkingHours: withinHours,
    })

    expect(result).toEqual({
      available: false,
      reason: "slot_conflict",
    })
  })

  it("returns outside_working_hours when outside clinic hours", async () => {
    const result = await checkProfessionalAvailability(baseInput, {
      hasOverlappingActiveAppointment: async () => false,
      hasOverlappingScheduleBlock: async () => false,
      isWithinWorkingHours: async () => false,
    })

    expect(result).toEqual({
      available: false,
      reason: "outside_working_hours",
    })
  })

  it("returns slot_conflict when a schedule block overlaps", async () => {
    const result = await checkProfessionalAvailability(baseInput, {
      hasOverlappingActiveAppointment: async () => false,
      hasOverlappingScheduleBlock: async () => true,
      isWithinWorkingHours: withinHours,
    })

    expect(result).toEqual({ available: false, reason: "slot_conflict" })
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
        hasOverlappingScheduleBlock: async () => false,
        isWithinWorkingHours: withinHours,
      },
    )

    expect(received?.excludeAppointmentId).toBe(VALID_UUID)
  })
})

describe("professionalAvailabilityService.ensureAvailable", () => {
  const availabilityMocks = {
    isWithinWorkingHours: async () => true,
    getSuggestionDayContext: async () => ({
      timeZone: "America/Sao_Paulo",
      getDayIntervals: () => [
        { startMinutes: 7 * 60, endMinutes: 19 * 60 },
      ],
    }),
  }

  it("resolves when the professional is available", async () => {
    await professionalAvailabilityService.ensureAvailable(baseInput, {
      hasOverlappingActiveAppointment: async () => false,
      hasOverlappingScheduleBlock: async () => false,
      listBusyIntervals: async () => [],
      ...availabilityMocks,
    })
  })

  it("throws APPOINTMENT_SLOT_UNAVAILABLE with suggested slots on conflict", async () => {
    try {
      await professionalAvailabilityService.ensureAvailable(baseInput, {
                hasOverlappingActiveAppointment: async () => true,
                hasOverlappingScheduleBlock: async () => false,
                listBusyIntervals: async () => [
                  {
                    startsAt: baseInput.startsAt,
                    endsAt: baseInput.endsAt,
                  },
                ],
                ...availabilityMocks,
              })
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(
        ((error: unknown) => {
                if (
                  !(error instanceof AppError) ||
                  error.code !== ErrorCode.APPOINTMENT_SLOT_UNAVAILABLE
                ) {
                  return false
                }
        
                const slots = readSuggestedSlotsFromMeta(error.meta)
                return slots.length > 0
              })(error),
      ).toBe(true)
    }
  })

  it("throws PROFESSIONAL_OUTSIDE_WORKING_HOURS with clinic-hour suggestions", async () => {
    try {
      await professionalAvailabilityService.ensureAvailable(baseInput, {
                hasOverlappingActiveAppointment: async () => false,
                hasOverlappingScheduleBlock: async () => false,
                listBusyIntervals: async () => [],
                isWithinWorkingHours: async () => false,
                getSuggestionDayContext: async () => ({
                  timeZone: "America/Sao_Paulo",
                  getDayIntervals: () => [
                    { startMinutes: 8 * 60, endMinutes: 18 * 60 },
                  ],
                }),
              })
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(
        ((error: unknown) => {
                if (
                  !(error instanceof AppError) ||
                  error.code !== ErrorCode.PROFESSIONAL_OUTSIDE_WORKING_HOURS
                ) {
                  return false
                }
        
                const slots = readSuggestedSlotsFromMeta(error.meta)
                return slots.length > 0
              })(error),
      ).toBe(true)
    }
  })
})

describe("formatSuggestedSlotLabel", () => {
  const now = new Date(2026, 6, 23, 9, 0, 0)

  it("labels a slot on the same day as Hoje", () => {
    expect(formatSuggestedSlotLabel(new Date(2026, 6, 23, 15, 30, 0), now)).toBe("Hoje às 15:30")
  })

  it("labels a slot on the next day as Amanhã", () => {
    expect(formatSuggestedSlotLabel(new Date(2026, 6, 24, 10, 0, 0), now)).toBe("Amanhã às 10:00")
  })

  it("labels later days with weekday and date", () => {
    expect(formatSuggestedSlotLabel(new Date(2026, 6, 27, 11, 0, 0), now)).toBe("seg. 27/07/2026")
  })
})

describe("findNextAvailableStarts", () => {
  const timeZone = "America/Sao_Paulo"

  it("skips a busy interval and returns the next free starts", () => {
    // 10:00 BRT on 2026-07-23
    const after = new Date("2026-07-23T13:00:00.000Z")
    const slots = findNextAvailableStarts({
      after,
      durationMs: 30 * 60 * 1000,
      timeZone,
      busy: [
        {
          startsAt: new Date("2026-07-23T13:00:00.000Z"),
          endsAt: new Date("2026-07-23T14:00:00.000Z"),
        },
      ],
      limit: 2,
    })

    expect(slots.length).toBe(2)
    expect(slots[0]?.toISOString()).toBe("2026-07-23T14:00:00.000Z") // 11:00 BRT
    expect(slots[1]?.toISOString()).toBe("2026-07-23T14:30:00.000Z") // 11:30 BRT
  })

  it("starts from the next step after an unaligned 'now' without skipping a valid slot", () => {
    // 15:07 BRT
    const after = new Date("2026-07-23T18:07:00.000Z")
    const slots = findNextAvailableStarts({
      after,
      durationMs: 30 * 60 * 1000,
      timeZone,
      busy: [],
      limit: 1,
    })

    expect(slots.length).toBe(1)
    expect(slots[0]?.toISOString()).toBe("2026-07-23T18:30:00.000Z") // 15:30 BRT
  })

  it("suggests the next clinic open after closing time in the clinic timezone", () => {
    // 19:00 BRT = closing for default 07–19 window
    const after = new Date("2026-07-23T22:00:00.000Z")
    const slots = findNextAvailableStarts({
      after,
      durationMs: 30 * 60 * 1000,
      timeZone,
      busy: [],
      limit: 1,
    })

    expect(slots.length).toBe(1)
    // Next day 07:00 BRT
    expect(slots[0]?.toISOString()).toBe("2026-07-24T10:00:00.000Z")
  })

  it("respects split clinic intervals (skips lunch break)", () => {
    // 11:45 BRT — morning window closes at 12:00
    const after = new Date("2026-07-23T14:45:00.000Z")
    const slots = findNextAvailableStarts({
      after,
      durationMs: 30 * 60 * 1000,
      timeZone,
      busy: [],
      limit: 1,
      getDayIntervals: () => [
        { startMinutes: 8 * 60, endMinutes: 12 * 60 },
        { startMinutes: 14 * 60, endMinutes: 18 * 60 },
      ],
    })

    expect(slots.length).toBe(1)
    // 14:00 BRT after lunch
    expect(slots[0]?.toISOString()).toBe("2026-07-23T17:00:00.000Z")
  })
})

describe("readSuggestedSlotsFromMeta", () => {
  it("filters invalid values from meta.suggestedSlots", () => {
    expect(readSuggestedSlotsFromMeta({
        suggestedSlots: ["2026-07-23T15:00:00.000Z", "nope", 12],
      })).toEqual(["2026-07-23T15:00:00.000Z"])
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
    expect(resolveVisibleHourRange(splitDayWeek, [monday])).toEqual({
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

    expect(ranges).toEqual([
      { startMinutes: 12 * 60, endMinutes: 14 * 60 },
    ])
  })

  it("marks a closed day as fully unavailable", () => {
    const sunday = new Date(2026, 6, 19)
    const ranges = getUnavailableMinuteRanges(splitDayWeek, sunday, {
      start: 8,
      end: 18,
    })

    expect(ranges).toEqual([
      { startMinutes: 8 * 60, endMinutes: 18 * 60 },
    ])
  })

  it("detects open vs break minutes", () => {
    const monday = new Date(2026, 6, 20)
    expect(isWithinOpenClinicMinutes(splitDayWeek, monday, 9 * 60)).toBe(true)
    expect(isWithinOpenClinicMinutes(splitDayWeek, monday, 13 * 60)).toBe(false)
  })
})

describe("agenda href round-trip", () => {
  it("builds agenda href with mode and date", () => {
    expect(buildAgendaHref({ mode: "week", date: "2026-07-20" })).toBe("/appointments?mode=week&date=2026-07-20")
  })

  it("preserves agenda location on attendance href", () => {
    expect(buildAttendanceHref(VALID_UUID, {
        mode: "day",
        date: new Date(2026, 6, 24),
      })).toBe(`/appointments/${VALID_UUID}/attendance?mode=day&date=2026-07-24`)
  })

  it("reads agenda location from search params", () => {
    const params = new URLSearchParams("mode=month&date=2026-07-01")
    expect(agendaLocationFromSearchParams(params)).toEqual({
      mode: "month",
      date: "2026-07-01",
    })
  })

  it("appends attendance panel while preserving agenda location", () => {
    expect(
      buildAttendanceHref(VALID_UUID, {
        mode: "week",
        date: "2026-07-20",
        panel: "vitals",
      }),
    ).toBe(
      `/appointments/${VALID_UUID}/attendance?mode=week&date=2026-07-20&panel=vitals`,
    )
  })

  it("ignores invalid attendance panel", () => {
    expect(
      buildAttendanceHref(VALID_UUID, {
        panel: "notes" as never,
      }),
    ).toBe(`/appointments/${VALID_UUID}/attendance`)
  })

  it("reads panel from search params", () => {
    const params = new URLSearchParams("mode=day&panel=documents")
    expect(attendancePanelFromSearchParams(params)).toBe("documents")
    expect(isAttendancePanel("patient")).toBe(true)
    expect(isAttendancePanel("notes")).toBe(false)
  })

  it("builds redirect href preserving agenda params and setting panel", () => {
    expect(
      buildAttendanceRedirectHref(
        VALID_UUID,
        { mode: "day", date: "2026-07-24" },
        "documents",
      ),
    ).toBe(
      `/appointments/${VALID_UUID}/attendance?mode=day&date=2026-07-24&panel=documents`,
    )
  })

  it("drops panel on notes redirect", () => {
    expect(
      buildAttendanceRedirectHref(VALID_UUID, {
        mode: "month",
        date: "2026-07-01",
        panel: "vitals",
      }),
    ).toBe(
      `/appointments/${VALID_UUID}/attendance?mode=month&date=2026-07-01`,
    )
  })
})

describe("appointment new href", () => {
  it("returns base path when no params", () => {
    expect(buildAppointmentNewHref()).toBe("/appointments/new")
  })

  it("omits empty optional params", () => {
    expect(buildAppointmentNewHref({
        patientId: VALID_UUID,
        professionalId: "",
        reason: "  ",
      })).toBe(`/appointments/new?patientId=${VALID_UUID}`)
  })

  it("serializes wall-clock date/time and labels (preferred over startsAt)", () => {
    expect(buildAppointmentNewHref({
        patientId: VALID_UUID,
        patientName: "Ana",
        lockPatient: true,
        professionalId: VALID_UUID,
        professionalName: "Dra. Bia",
        date: "2026-08-20",
        startTime: "14:30",
        startsAt: new Date("2026-08-20T17:30:00.000Z"),
        type: "follow_up",
        modality: "online",
        durationMinutes: 45,
        serviceId: VALID_UUID,
        waitlistId: VALID_UUID,
      })).toBe(`/appointments/new?patientId=${VALID_UUID}&patientName=Ana&lockPatient=1&professionalId=${VALID_UUID}&professionalName=Dra.+Bia&date=2026-08-20&startTime=14%3A30&type=follow_up&modality=online&durationMinutes=45&serviceId=${VALID_UUID}&waitlistId=${VALID_UUID}`)
  })

  it("falls back to startsAt ISO when date/time are missing", () => {
    const startsAt = new Date("2026-08-20T14:30:00.000Z")
    expect(buildAppointmentNewHref({
        patientId: VALID_UUID,
        startsAt,
      })).toBe(`/appointments/new?patientId=${VALID_UUID}&startsAt=2026-08-20T14%3A30%3A00.000Z`)
  })

  it("reads wall-clock params and locks on waitlist", () => {
    const params = new URLSearchParams(
      `patientId=${VALID_UUID}&patientName=Ana&professionalName=Dra.+Bia&date=2026-08-20&startTime=14:30&waitlistId=${VALID_UUID}&serviceId=${VALID_UUID}&durationMinutes=45`,
    )
    const location = appointmentNewLocationFromSearchParams(params)
    expect(location.patientId).toBe(VALID_UUID)
    expect(location.patientName).toBe("Ana")
    expect(location.professionalName).toBe("Dra. Bia")
    expect(location.date).toBe("2026-08-20")
    expect(location.startTime).toBe("14:30")
    expect(location.lockPatient).toBe(true)
    expect(location.waitlistId).toBe(VALID_UUID)
    expect(location.serviceId).toBe(VALID_UUID)
    expect(location.durationMinutes).toBe("45")
    expect(location.startsAt?.getFullYear()).toBe(2026)
    expect(location.startsAt?.getMonth()).toBe(7)
    expect(location.startsAt?.getDate()).toBe(20)
    expect(location.startsAt?.getHours()).toBe(14)
    expect(location.startsAt?.getMinutes()).toBe(30)
  })
})

describe("intersectMinuteIntervals", () => {
  it("returns the overlap between two interval lists", () => {
    const result = intersectMinuteIntervals(
      [{ startMinutes: 480, endMinutes: 720 }],
      [{ startMinutes: 540, endMinutes: 780 }],
    )
    expect(result).toEqual([{ startMinutes: 540, endMinutes: 720 }])
  })

  it("skips non-overlapping intervals", () => {
    const result = intersectMinuteIntervals(
      [{ startMinutes: 480, endMinutes: 600 }],
      [{ startMinutes: 600, endMinutes: 720 }],
    )
    expect(result).toEqual([])
  })

  it("handles multiple intervals on each side", () => {
    const result = intersectMinuteIntervals(
      [
        { startMinutes: 480, endMinutes: 600 },
        { startMinutes: 780, endMinutes: 1020 },
      ],
      [{ startMinutes: 540, endMinutes: 900 }],
    )
    expect(result).toEqual([
      { startMinutes: 540, endMinutes: 600 },
      { startMinutes: 780, endMinutes: 900 },
    ])
  })

  it("returns an empty list when either side is empty", () => {
    expect(intersectMinuteIntervals([], [{ startMinutes: 0, endMinutes: 60 }])).toEqual([])
    expect(intersectMinuteIntervals([{ startMinutes: 0, endMinutes: 60 }], [])).toEqual([])
  })
})

describe("getEffectiveMinuteIntervals (professional hours intersection)", () => {
  const clinicHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: dayOfWeek === 0,
    intervals:
      dayOfWeek === 0 ? [] : [{ opensAt: "07:00", closesAt: "19:00" }],
  }))

  it("inherits clinic hours 100% when the professional has no configured rows", () => {
    const result = getEffectiveMinuteIntervals({
      clinicHours,
      professionalHours: null,
      dayOfWeek: 1,
    })
    expect(result).toEqual([{ startMinutes: 7 * 60, endMinutes: 19 * 60 }])
  })

  it("narrows to the intersection when the professional has a tighter window", () => {
    const professionalHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      isClosed: dayOfWeek !== 1,
      intervals: dayOfWeek === 1 ? [{ opensAt: "09:00", closesAt: "12:00" }] : [],
    }))

    const result = getEffectiveMinuteIntervals({
      clinicHours,
      professionalHours,
      dayOfWeek: 1,
    })
    expect(result).toEqual([{ startMinutes: 9 * 60, endMinutes: 12 * 60 }])
  })

  it("is empty when the professional is closed even though the clinic is open", () => {
    const professionalHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      isClosed: true,
      intervals: [],
    }))

    const result = getEffectiveMinuteIntervals({
      clinicHours,
      professionalHours,
      dayOfWeek: 1,
    })
    expect(result).toEqual([])
  })

  it("isWithinEffectiveHours respects the intersected window", () => {
    const professionalHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      isClosed: dayOfWeek !== 1,
      intervals: dayOfWeek === 1 ? [{ opensAt: "09:00", closesAt: "12:00" }] : [],
    }))
    const getZonedDayParts = (date: Date) => ({
      dayOfWeek: 1,
      minutes: date.getUTCHours() * 60 + date.getUTCMinutes(),
    })

    expect(isWithinEffectiveHours({
        startsAt: new Date("2026-01-05T10:00:00.000Z"),
        endsAt: new Date("2026-01-05T11:00:00.000Z"),
        clinicHours,
        professionalHours,
        timeZone: "UTC",
        getZonedDayParts,
      })).toBe(true)

    expect(isWithinEffectiveHours({
        startsAt: new Date("2026-01-05T13:00:00.000Z"),
        endsAt: new Date("2026-01-05T14:00:00.000Z"),
        clinicHours,
        professionalHours,
        timeZone: "UTC",
        getZonedDayParts,
      })).toBe(false)
  })
})

describe("isAppointmentConfirmableInBatch", () => {
  it("allows a scheduled appointment with no professional scoping", () => {
    expect(isAppointmentConfirmableInBatch({
        status: "scheduled",
        professionalId: OTHER_UUID,
        ownProfessionalId: null,
      })).toBe(true)
  })

  it("skips a non-scheduled appointment", () => {
    expect(isAppointmentConfirmableInBatch({
        status: "confirmed",
        professionalId: OTHER_UUID,
        ownProfessionalId: null,
      })).toBe(false)
  })

  it("skips appointments outside the caller's own agenda when scoped", () => {
    expect(isAppointmentConfirmableInBatch({
        status: "scheduled",
        professionalId: OTHER_UUID,
        ownProfessionalId: VALID_UUID,
      })).toBe(false)
  })

  it("allows scoped confirm for the caller's own appointment", () => {
    expect(isAppointmentConfirmableInBatch({
        status: "scheduled",
        professionalId: VALID_UUID,
        ownProfessionalId: VALID_UUID,
      })).toBe(true)
  })
})

describe("appointment-time", () => {
  it("returns duration in whole minutes", () => {
    expect(
      getAppointmentDurationMinutes(
        new Date("2026-01-05T10:00:00.000Z"),
        new Date("2026-01-05T10:30:00.000Z"),
      ),
    ).toBe(30)
  })

  it("detects overlapping and non-overlapping ranges", () => {
    const aStart = new Date("2026-01-05T10:00:00.000Z")
    const aEnd = new Date("2026-01-05T11:00:00.000Z")
    expect(
      rangesOverlap(
        aStart,
        aEnd,
        new Date("2026-01-05T10:30:00.000Z"),
        new Date("2026-01-05T11:30:00.000Z"),
      ),
    ).toBe(true)
    expect(
      rangesOverlap(
        aStart,
        aEnd,
        new Date("2026-01-05T11:00:00.000Z"),
        new Date("2026-01-05T12:00:00.000Z"),
      ),
    ).toBe(false)
  })
})
