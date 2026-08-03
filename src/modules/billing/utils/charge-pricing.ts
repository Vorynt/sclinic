import { AppError, ErrorCode } from "@/shared/errors"

export type BillingKind = "standard" | "courtesy" | "return"

export function computeChargeAmountCents(params: {
  listAmountCents: number
  discountPercent: number
  billingKind: BillingKind
  amountCentsOverride?: number
}): number {
  if (params.billingKind === "courtesy" || params.billingKind === "return") {
    return 0
  }

  if (params.amountCentsOverride !== undefined) {
    if (params.amountCentsOverride < 0) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "Valor override deve ser maior ou igual a zero.",
      })
    }
    return params.amountCentsOverride
  }

  return Math.round(
    (params.listAmountCents * (100 - params.discountPercent)) / 100,
  )
}
