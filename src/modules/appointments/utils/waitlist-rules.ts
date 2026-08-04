import type { WaitlistEntry } from "@/modules/appointments/types/waitlist"
import { AppError, ErrorCode } from "@/shared/errors"

/**
 * Pure guard for the waitlist → appointment promote flow (unit-testable).
 * Returns the entry when promotable, throws otherwise.
 */
export function assertWaitlistPromotable(params: {
  entry: WaitlistEntry | null
  appointmentPatientId: string
}): WaitlistEntry {
  const { entry, appointmentPatientId } = params

  if (!entry) {
    throw new AppError(ErrorCode.NOT_FOUND, {
      message: "Item da lista de espera não encontrado.",
    })
  }

  if (entry.status !== "waiting") {
    throw new AppError(ErrorCode.CONFLICT, {
      message: "Este item não está mais aguardando na fila.",
    })
  }

  if (appointmentPatientId !== entry.patientId) {
    throw new AppError(ErrorCode.VALIDATION_FAILED, {
      message: "O paciente do agendamento deve ser o da lista de espera.",
    })
  }

  return entry
}
