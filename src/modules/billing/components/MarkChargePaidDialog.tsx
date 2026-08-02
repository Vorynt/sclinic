"use client"

import { useEffect, useMemo, useState } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BILLING_KIND_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/billing/constants/charges"
import { MANUAL_PAYMENT_METHODS } from "@/modules/billing/schemas/charge.schema"
import type { ManualPaymentMethod } from "@/modules/billing/types/charge"
import {
  computeChargeAmountCents,
  type BillingKind,
} from "@/modules/billing/utils/charge-pricing"
import {
  formatCentsToBrl,
  isEmptyMoneyInput,
  parseBrlToCents,
} from "@/modules/billing/utils/money"

export type MarkChargePaidConfirmPayload = {
  method: ManualPaymentMethod
  discountPercent?: number
  amountCentsOverride?: number
}

type MarkChargePaidDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  isPending?: boolean
  listAmountCents?: number
  discountPercent?: number
  serviceName?: string
  billingKind?: BillingKind
  canManage?: boolean
  onConfirm: (payload: MarkChargePaidConfirmPayload) => void
}

function clampDiscount(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function MarkChargePaidDialog({
  open,
  onOpenChange,
  title = "Registrar pagamento",
  description,
  confirmLabel = "Confirmar",
  isPending = false,
  listAmountCents,
  discountPercent = 0,
  serviceName,
  billingKind = "standard",
  canManage = false,
  onConfirm,
}: MarkChargePaidDialogProps) {
  const [method, setMethod] = useState<ManualPaymentMethod>("pix_manual")
  const [discount, setDiscount] = useState(() => clampDiscount(discountPercent))
  const [overrideBrl, setOverrideBrl] = useState("")

  useEffect(() => {
    if (!open) return
    setMethod("pix_manual")
    setDiscount(clampDiscount(discountPercent))
    setOverrideBrl("")
  }, [open, discountPercent])

  const isZeroKind =
    billingKind === "courtesy" || billingKind === "return"

  const amountCentsOverride = useMemo(() => {
    if (!canManage || isZeroKind || isEmptyMoneyInput(overrideBrl)) {
      return undefined
    }
    return parseBrlToCents(overrideBrl) ?? undefined
  }, [canManage, isZeroKind, overrideBrl])

  const finalAmountCents = useMemo(() => {
    if (listAmountCents == null) return null
    return computeChargeAmountCents({
      listAmountCents,
      discountPercent: discount,
      billingKind,
      amountCentsOverride,
    })
  }, [amountCentsOverride, billingKind, discount, listAmountCents])

  const summaryLines = [
    serviceName ? `Serviço: ${serviceName}` : null,
    listAmountCents != null
      ? `Valor de lista: ${formatCentsToBrl(listAmountCents)}`
      : null,
    billingKind !== "standard"
      ? `Tipo: ${BILLING_KIND_LABELS[billingKind]}`
      : null,
    finalAmountCents != null
      ? `Valor final: ${formatCentsToBrl(finalAmountCents)}`
      : null,
  ].filter(Boolean)

  function handleConfirm() {
    const payload: MarkChargePaidConfirmPayload = { method }

    if (!isZeroKind && discount !== clampDiscount(discountPercent)) {
      payload.discountPercent = discount
    }

    if (amountCentsOverride != null) {
      payload.amountCentsOverride = amountCentsOverride
    }

    onConfirm(payload)
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setMethod("pix_manual")
          setDiscount(clampDiscount(discountPercent))
          setOverrideBrl("")
        }
        onOpenChange(next)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
          {summaryLines.length > 0 ? (
            <div className="flex flex-col gap-1 pt-1 text-sm text-muted-foreground">
              {summaryLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {!isZeroKind && listAmountCents != null ? (
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                htmlFor="mark-paid-discount"
              >
                Desconto (%)
              </label>
              <Input
                id="mark-paid-discount"
                type="number"
                min={0}
                max={100}
                step={1}
                value={discount}
                onChange={(event) =>
                  setDiscount(clampDiscount(Number(event.target.value)))
                }
              />
            </div>
          ) : null}

          {canManage && !isZeroKind && listAmountCents != null ? (
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                htmlFor="mark-paid-override"
              >
                Valor final (override)
              </label>
              <Input
                id="mark-paid-override"
                inputMode="decimal"
                placeholder="Opcional — ex.: 150,00"
                value={overrideBrl}
                onChange={(event) => setOverrideBrl(event.target.value)}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="mark-paid-method">
              Forma de pagamento
            </label>
            <Select
              value={method}
              onValueChange={(value) => setMethod(value as ManualPaymentMethod)}
            >
              <SelectTrigger id="mark-paid-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_PAYMENT_METHODS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PAYMENT_METHOD_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Voltar</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
