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
import { AppError, ErrorCode } from "@/shared/errors"

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
}

const defaultDeps: AvailabilityDeps = {
  hasOverlappingActiveAppointment:
    appointmentRepository.hasOverlappingActiveAppointment,
  listBusyIntervals: appointmentRepository.listBusyIntervals,
}

/**
 * Pure check used by the service and unit tests.
 * Working hours are a no-op until professionals can define schedules.
 */
export async function checkProfessionalAvailability(
  input: ProfessionalAvailabilityInput,
  deps: Pick<AvailabilityDeps, "hasOverlappingActiveAppointment">,
): Promise<ProfessionalAvailabilityResult> {
  const withinHours = await isWithinConfiguredWorkingHours(input)
  if (!withinHours) {
    return { available: false, reason: "outside_working_hours" }
  }

  const hasConflict = await deps.hasOverlappingActiveAppointment(input)
  if (hasConflict) {
    return { available: false, reason: "slot_conflict" }
  }

  return { available: true }
}

/**
 * Placeholder for professional-defined schedules (clinic working hours / breaks).
 * Always returns true until that feature exists.
 */
async function isWithinConfiguredWorkingHours(
  _input: ProfessionalAvailabilityInput,
): Promise<boolean> {
  return true
}

async function loadSuggestedSlotIsos(
  input: ProfessionalAvailabilityInput,
  deps: Pick<AvailabilityDeps, "listBusyIntervals">,
): Promise<string[]> {
  const durationMs = input.endsAt.getTime() - input.startsAt.getTime()
  if (durationMs <= 0) {
    return []
  }

  const searchTo = new Date(input.startsAt)
  searchTo.setDate(searchTo.getDate() + SUGGESTED_SLOTS_SEARCH_DAYS)

  const busy = await deps.listBusyIntervals({
    clinicId: input.clinicId,
    professionalId: input.professionalId,
    from: input.startsAt,
    to: searchTo,
    excludeAppointmentId: input.excludeAppointmentId,
  })

  return findNextAvailableStarts({
    after: input.startsAt,
    durationMs,
    busy,
    limit: SUGGESTED_SLOTS_LIMIT,
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
      message: "Horário fora da disponibilidade do profissional.",
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
   * Ensures the professional can take the slot; throws AppError when not.
   * On conflict, attaches the next free slots in `meta.suggestedSlots`.
   */
  async ensureAvailable(
    input: ProfessionalAvailabilityInput,
    deps: AvailabilityDeps = defaultDeps,
  ): Promise<void> {
    const result = await checkProfessionalAvailability(input, deps)

    if (result.available) {
      return
    }

    const suggestedSlots =
      result.reason === "slot_conflict"
        ? await loadSuggestedSlotIsos(input, deps)
        : []

    throwForUnavailable(result, suggestedSlots)
  },
}
