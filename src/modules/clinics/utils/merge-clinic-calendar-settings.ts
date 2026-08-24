import { DEFAULT_CLINIC_CALENDAR_SETTINGS } from "@/modules/clinics/constants/default-calendar-settings"
import {
  clinicCalendarSettingsSchema,
  type CalendarCardPreset,
  type ClinicCalendarSettings,
} from "@/modules/clinics/schemas/clinic-calendar-settings.schema"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function mergeCardPreset(
  defaults: CalendarCardPreset,
  stored: unknown,
): CalendarCardPreset {
  if (!isRecord(stored)) return defaults

  return {
    showProfessional:
      typeof stored.showProfessional === "boolean"
        ? stored.showProfessional
        : defaults.showProfessional,
    showType:
      typeof stored.showType === "boolean" ? stored.showType : defaults.showType,
    showService:
      typeof stored.showService === "boolean"
        ? stored.showService
        : defaults.showService,
    showModality:
      typeof stored.showModality === "boolean"
        ? stored.showModality
        : defaults.showModality,
    showReason:
      typeof stored.showReason === "boolean"
        ? stored.showReason
        : defaults.showReason,
  }
}

/**
 * Fills missing keys from persisted JSON with product defaults.
 * Invalid documents fall back to a full default object.
 */
export function mergeClinicCalendarSettings(
  stored: unknown,
): ClinicCalendarSettings {
  if (!isRecord(stored)) {
    return DEFAULT_CLINIC_CALENDAR_SETTINGS
  }

  const defaultView = isRecord(stored.defaultView) ? stored.defaultView : {}
  const cardPresets = isRecord(stored.cardPresets) ? stored.cardPresets : {}

  const candidate = {
    defaultView: {
      operations: defaultView.operations,
      clinical: defaultView.clinical,
    },
    slotStepMinutes: stored.slotStepMinutes,
    weekStartsOn: stored.weekStartsOn,
    showCanceled: stored.showCanceled,
    cardPresets: {
      operations: mergeCardPreset(
        DEFAULT_CLINIC_CALENDAR_SETTINGS.cardPresets.operations,
        cardPresets.operations,
      ),
      clinical: mergeCardPreset(
        DEFAULT_CLINIC_CALENDAR_SETTINGS.cardPresets.clinical,
        cardPresets.clinical,
      ),
    },
  }

  const withDefaults = {
    defaultView: {
      operations:
        candidate.defaultView.operations ??
        DEFAULT_CLINIC_CALENDAR_SETTINGS.defaultView.operations,
      clinical:
        candidate.defaultView.clinical ??
        DEFAULT_CLINIC_CALENDAR_SETTINGS.defaultView.clinical,
    },
    slotStepMinutes:
      candidate.slotStepMinutes ??
      DEFAULT_CLINIC_CALENDAR_SETTINGS.slotStepMinutes,
    weekStartsOn:
      candidate.weekStartsOn ?? DEFAULT_CLINIC_CALENDAR_SETTINGS.weekStartsOn,
    showCanceled:
      candidate.showCanceled ?? DEFAULT_CLINIC_CALENDAR_SETTINGS.showCanceled,
    cardPresets: candidate.cardPresets,
  }

  const parsed = clinicCalendarSettingsSchema.safeParse(withDefaults)
  return parsed.success ? parsed.data : DEFAULT_CLINIC_CALENDAR_SETTINGS
}
