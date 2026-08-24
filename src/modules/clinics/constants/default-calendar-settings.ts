import type {
  CalendarCardPreset,
  ClinicCalendarSettings,
} from "@/modules/clinics/schemas/clinic-calendar-settings.schema"

export const DEFAULT_OPERATIONS_CARD_PRESET: CalendarCardPreset = {
  showProfessional: true,
  showType: false,
  showService: false,
  showModality: false,
  showReason: false,
}

export const DEFAULT_CLINICAL_CARD_PRESET: CalendarCardPreset = {
  showProfessional: false,
  showType: false,
  showService: false,
  showModality: false,
  showReason: false,
}

export const DEFAULT_CLINIC_CALENDAR_SETTINGS: ClinicCalendarSettings = {
  defaultView: {
    operations: "week",
    clinical: "day",
  },
  slotStepMinutes: 30,
  weekStartsOn: 1,
  showCanceled: true,
  cardPresets: {
    operations: DEFAULT_OPERATIONS_CARD_PRESET,
    clinical: DEFAULT_CLINICAL_CARD_PRESET,
  },
}
