import { AppError, ErrorCode } from "@/shared/errors"
import type { ChargeStatus } from "@/modules/billing/types/charge"

/** Pure guards for clinical charge lifecycle (unit-testable). */
export function assertChargePendingForPayment(status: ChargeStatus): void {
  if (status !== "pending") {
    throw new AppError(ErrorCode.CONFLICT, {
      message: "Só é possível registrar pagamento em cobranças pendentes.",
    })
  }
}

export function assertChargePendingForCancel(status: ChargeStatus): void {
  if (status !== "pending") {
    throw new AppError(ErrorCode.CONFLICT, {
      message: "Só é possível cancelar cobranças pendentes.",
    })
  }
}

export function assertAppointmentChargeable(status: string): void {
  if (status === "canceled") {
    throw new AppError(ErrorCode.CONFLICT, {
      message: "Não é possível criar cobrança para um agendamento cancelado.",
    })
  }
}
