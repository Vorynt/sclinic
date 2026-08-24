import { describe, expect, it } from "@jest/globals"

import { DEFAULT_CLINIC_CALENDAR_SETTINGS } from "@/modules/clinics/constants/default-calendar-settings"
import { clinicCalendarSettingsSchema } from "@/modules/clinics/schemas/clinic-calendar-settings.schema"
import { mergeClinicCalendarSettings } from "@/modules/clinics/utils/merge-clinic-calendar-settings"

describe("clinicCalendarSettingsSchema", () => {
  it("accepts the product defaults", () => {
    const parsed = clinicCalendarSettingsSchema.parse(
      DEFAULT_CLINIC_CALENDAR_SETTINGS,
    )
    expect(parsed.defaultView.operations).toBe("week")
    expect(parsed.defaultView.clinical).toBe("day")
    expect(parsed.slotStepMinutes).toBe(30)
    expect(parsed.weekStartsOn).toBe(1)
    expect(parsed.cardPresets.operations.showProfessional).toBe(true)
    expect(parsed.cardPresets.clinical.showProfessional).toBe(false)
  })

  it("rejects an invalid slot step", () => {
    const result = clinicCalendarSettingsSchema.safeParse({
      ...DEFAULT_CLINIC_CALENDAR_SETTINGS,
      slotStepMinutes: 20,
    })
    expect(result.success).toBe(false)
  })

  it("rejects an invalid week start", () => {
    const result = clinicCalendarSettingsSchema.safeParse({
      ...DEFAULT_CLINIC_CALENDAR_SETTINGS,
      weekStartsOn: 3,
    })
    expect(result.success).toBe(false)
  })
})

describe("mergeClinicCalendarSettings", () => {
  it("returns defaults when nothing is stored", () => {
    expect(mergeClinicCalendarSettings(null)).toEqual(
      DEFAULT_CLINIC_CALENDAR_SETTINGS,
    )
    expect(mergeClinicCalendarSettings(undefined)).toEqual(
      DEFAULT_CLINIC_CALENDAR_SETTINGS,
    )
  })

  it("fills missing keys from a partial document", () => {
    const merged = mergeClinicCalendarSettings({
      density: "compact",
      showCanceled: false,
      cardPresets: {
        operations: { showType: true },
      },
    })

    expect(merged.showCanceled).toBe(false)
    expect(merged.slotStepMinutes).toBe(30)
    expect(merged.defaultView.operations).toBe("week")
    expect(merged.cardPresets.operations.showType).toBe(true)
    expect(merged.cardPresets.operations.showProfessional).toBe(true)
    expect(merged.cardPresets.operations.showService).toBe(false)
    expect(merged.cardPresets.clinical.showProfessional).toBe(false)
  })

  it("falls back to defaults when stored values are invalid", () => {
    const merged = mergeClinicCalendarSettings({
      slotStepMinutes: 5,
    })
    expect(merged).toEqual(DEFAULT_CLINIC_CALENDAR_SETTINGS)
  })
})
