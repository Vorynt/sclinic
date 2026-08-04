import { appointmentRepository } from "@/modules/appointments/repositories/appointment.repository"
import type {
  AvailabilityErrorMeta,
  BusyInterval,
  ProfessionalAvailabilityInput,
  ProfessionalAvailabilityResult,
} from "@/modules/appointments/types/availability"
import {
  findNextAvailableStarts,
  SUGGESTED_SLOTS_LIMIT,
  SUGGESTED_SLOTS_SEARCH_DAYS,
} from "@/modules/appointments/utils/suggested-slots"
import { clinicHoursService } from "@/modules/clinics/services/clinic-hours.service"
import {
  getMinuteIntervalsForDay,
  getZonedDayParts,
  isWithinClinicHours,
} from "@/modules/clinics/utils/clinic-hours-window"
import { AppError, ErrorCode } from "@/shared/errors"

type DayIntervalsResolver = {
  timeZone: string
  getDayIntervals: (day: Date) => { startMinutes: number; endMinutes: number }[]
}

type AvailabilityDeps = {
  hasOverlappingActiveAppointment: (
    input: ProfessionalAvailabilityInput,
  ) => Promise<boolean>
  listBusyIntervals: (params: {
    clinicId: string
    professionalId: string
    from: Date
    to: Date
    excludeAppointmentId?: string
  }) => Promise<BusyInterval[]>
  isWithinWorkingHours: (
    input: ProfessionalAvailabilityInput,
  ) => Promise<boolean>
  getSuggestionDayContext: (
    input: ProfessionalAvailabilityInput,
  ) => Promise<DayIntervalsResolver>
}

async function defaultIsWithinWorkingHours(
  input: ProfessionalAvailabilityInput,
): Promise<boolean> {
  const { weeklyHours, timeZone } =
    await clinicHoursService.getAvailabilityContext(input.clinicId)

  return isWithinClinicHours({
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    weeklyHours,
    timeZone,
  })
}

async function defaultGetSuggestionDayContext(
  input: ProfessionalAvailabilityInput,
): Promise<DayIntervalsResolver> {
  const { weeklyHours, timeZone } =
    await clinicHoursService.getAvailabilityContext(input.clinicId)

  return {
    timeZone,
    getDayIntervals: (day: Date) => {
      const { dayOfWeek } = getZonedDayParts(day, timeZone)
      return getMinuteIntervalsForDay(weeklyHours, dayOfWeek)
    },
  }
}

const defaultDeps: AvailabilityDeps = {
  hasOverlappingActiveAppointment:
    appointmentRepository.hasOverlappingActiveAppointment,
  listBusyIntervals: appointmentRepository.listBusyIntervals,
  isWithinWorkingHours: defaultIsWithinWorkingHours,
  getSuggestionDayContext: defaultGetSuggestionDayContext,
}

/**
 * Pure check used by the service and unit tests.
 * Working hours today = clinic business hours (professional schedules TBD).
 */
export async function checkProfessionalAvailability(
  input: ProfessionalAvailabilityInput,
  deps: Pick<
    AvailabilityDeps,
    "hasOverlappingActiveAppointment" | "isWithinWorkingHours"
  >,
): Promise<ProfessionalAvailabilityResult> {
  const withinHours = await deps.isWithinWorkingHours(input)
  if (!withinHours) {
    return { available: false, reason: "outside_working_hours" }
  }

  const hasConflict = await deps.hasOverlappingActiveAppointment(input)
  if (hasConflict) {
    return { available: false, reason: "slot_conflict" }
  }

  return { available: true }
}

async function loadSuggestedSlotIsos(
  input: ProfessionalAvailabilityInput,
  deps: Pick<
    AvailabilityDeps,
    "listBusyIntervals" | "getSuggestionDayContext"
  >,
): Promise<string[]> {
  const durationMs = input.endsAt.getTime() - input.startsAt.getTime()
  if (durationMs <= 0) {
    return []
  }

  const now = new Date()
  const after =
    input.startsAt.getTime() > now.getTime() ? input.startsAt : now

  const { timeZone, getDayIntervals } = await deps.getSuggestionDayContext(
    input,
  )

  const searchTo = new Date(
    after.getTime() + SUGGESTED_SLOTS_SEARCH_DAYS * 24 * 60 * 60 * 1000,
  )

  const busy = await deps.listBusyIntervals({
    clinicId: input.clinicId,
    professionalId: input.professionalId,
    from: after,
    to: searchTo,
    excludeAppointmentId: input.excludeAppointmentId,
  })

  return findNextAvailableStarts({
    after,
    durationMs,
    busy,
    timeZone,
    limit: SUGGESTED_SLOTS_LIMIT,
    getDayIntervals,
  }).map((slot) => slot.toISOString())
}

function throwForUnavailable(
  result: Extract<ProfessionalAvailabilityResult, { available: false }>,
  suggestedSlots: string[],
): never {
  const meta: AvailabilityErrorMeta | undefined =
    suggestedSlots.length > 0 ? { suggestedSlots } : undefined

  if (result.reason === "outside_working_hours") {
    throw new AppError(ErrorCode.PROFESSIONAL_OUTSIDE_WORKING_HOURS, {
      message: "Horário fora do funcionamento da clínica.",
      meta,
    })
  }

  throw new AppError(ErrorCode.APPOINTMENT_SLOT_UNAVAILABLE, {
    message: "O profissional já possui um agendamento neste horário.",
    meta,
  })
}

export const professionalAvailabilityService = {
  /**
   * Ensures the slot is bookable; throws AppError when not.
   * Outside clinic hours or professional conflict → next free slots in `meta.suggestedSlots`.
   */
  async ensureAvailable(
    input: ProfessionalAvailabilityInput,
    deps: AvailabilityDeps = defaultDeps,
  ): Promise<void> {
    const result = await checkProfessionalAvailability(input, deps)

    if (result.available) {
      return
    }

    const suggestedSlots = await loadSuggestedSlotIsos(input, deps)
    throwForUnavailable(result, suggestedSlots)
  },
}
