import { PAYMENT_METHOD_LABELS } from "@/modules/billing/constants/charges"
import type { PaymentMethod } from "@/modules/billing/types/charge"

export function describeTopPaymentMethod(
  rows: Array<{ method: PaymentMethod; amountCents: number }>,
): string | null {
  const top = rows.reduce<{
    method: PaymentMethod
    amountCents: number
  } | null>((current, row) => {
    if (row.amountCents <= 0) return current
    if (!current || row.amountCents > current.amountCents) return row
    return current
  }, null)

  if (!top) return null

  const label = PAYMENT_METHOD_LABELS[top.method] ?? top.method
  return `A maior parte entrou via ${label}.`
}
