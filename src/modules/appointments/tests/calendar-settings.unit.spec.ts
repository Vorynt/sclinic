import { describe, expect, it } from "@jest/globals"

import type { Appointment } from "@/modules/appointments/types/appointment"
import { getVisibleRange } from "@/modules/appointments/utils/calendar-range"
import {
  filterVisibleCalendarAppointments,
  formatAppointmentStartTime,
  getAppointmentCardExtraFields,
  resolveCalendarCardFields,
  resolveCalendarSettingsPreset,
} from "@/modules/appointments/utils/calendar-settings"
import { DEFAULT_CLINIC_CALENDAR_SETTINGS } from "@/modules/clinics/constants/default-calendar-settings"

function appointment(
  overrides: Partial<Appointment> & { startsAt: Date },
): Appointment {
  return {
    id: "a1",
    clinicId: "c1",
    patientId: "p1",
    patientName: "Ana",
    professionalId: null,
    professionalName: null,
    serviceId: null,
    serviceName: null,
    type: "consultation",
    modality: "in_person",
    status: "scheduled",
    reason: null,
    notes: null,
    canceledAt: null,
    canceledReason: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: new Date(overrides.startsAt.getTime() + 30 * 60_000),
    ...overrides,
  }
}

describe("resolveCalendarSettingsPreset", () => {
  it("uses the clinical preset for self-schedule roles", () => {
    expect(resolveCalendarSettingsPreset("clinician")).toBe("clinical")
    expect(resolveCalendarSettingsPreset("nurse")).toBe("clinical")
  })

  it("uses the operations preset for reception and management", () => {
    expect(resolveCalendarSettingsPreset("receptionist")).toBe("operations")
    expect(resolveCalendarSettingsPreset("owner")).toBe("operations")
    expect(resolveCalendarSettingsPreset("admin")).toBe("operations")
    expect(resolveCalendarSettingsPreset(null)).toBe("operations")
  })
})

describe("resolveCalendarCardFields", () => {
  it("returns the preset selected for the role", () => {
    const settings = {
      ...DEFAULT_CLINIC_CALENDAR_SETTINGS,
      cardPresets: {
        ...DEFAULT_CLINIC_CALENDAR_SETTINGS.cardPresets,
        operations: {
          ...DEFAULT_CLINIC_CALENDAR_SETTINGS.cardPresets.operations,
          showType: true,
        },
      },
    }

    expect(resolveCalendarCardFields(settings, "operations").showType).toBe(
      true,
    )
    expect(resolveCalendarCardFields(settings, "clinical").showType).toBe(
      false,
    )
  })
})

describe("formatAppointmentStartTime", () => {
  it("returns only the start time", () => {
    const item = appointment({
      startsAt: new Date(2026, 7, 24, 14, 0),
      endsAt: new Date(2026, 7, 24, 14, 45),
    })
    expect(formatAppointmentStartTime(item)).toBe("14:00")
  })
})

describe("getAppointmentCardExtraFields", () => {
  it("includes only the fields enabled on the preset", () => {
    const item = appointment({
      startsAt: new Date(2026, 7, 24, 14, 0),
      professionalName: "Dra. Bia",
      serviceName: "Avaliação inicial",
      type: "follow_up",
      reason: "Retorno de rotina",
    })

    expect(
      getAppointmentCardExtraFields(item, {
        ...DEFAULT_CLINIC_CALENDAR_SETTINGS.cardPresets.operations,
        showProfessional: true,
        showType: true,
        showService: false,
        showReason: false,
      }).map((field) => field.id),
    ).toEqual(["professional", "type"])
  })
})

describe("filterVisibleCalendarAppointments", () => {
  it("keeps canceled appointments when showCanceled is true", () => {
    const canceled = appointment({
      id: "canceled",
      status: "canceled",
      startsAt: new Date(2026, 7, 24, 9, 0),
    })
    const scheduled = appointment({
      id: "scheduled",
      startsAt: new Date(2026, 7, 24, 10, 0),
    })

    expect(
      filterVisibleCalendarAppointments([canceled, scheduled], true).map(
        (item) => item.id,
      ),
    ).toEqual(["canceled", "scheduled"])
  })

  it("hides canceled appointments but keeps no-show", () => {
    const canceled = appointment({
      id: "canceled",
      status: "canceled",
      startsAt: new Date(2026, 7, 24, 9, 0),
    })
    const noShow = appointment({
      id: "no-show",
      status: "no_show",
      startsAt: new Date(2026, 7, 24, 10, 0),
    })

    expect(
      filterVisibleCalendarAppointments([canceled, noShow], false).map(
        (item) => item.id,
      ),
    ).toEqual(["no-show"])
  })
})

describe("getVisibleRange weekStartsOn", () => {
  it("starts the week on Monday by default", () => {
    const wednesday = new Date(2026, 7, 26)
    const range = getVisibleRange("week", wednesday)
    expect(range.from.getDay()).toBe(1)
    expect(range.to.getDay()).toBe(0)
  })

  it("starts the week on Sunday when configured", () => {
    const wednesday = new Date(2026, 7, 26)
    const range = getVisibleRange("week", wednesday, { weekStartsOn: 0 })
    expect(range.from.getDay()).toBe(0)
    expect(range.to.getDay()).toBe(6)
  })
})
