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
import { Slider } from "@/components/ui/slider"
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

const DISCOUNT_PRESETS = [5, 10, 15, 20] as const

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
  patientName?: string
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
  description = "Confirme o valor e como o paciente pagou.",
  confirmLabel = "Receber pagamento",
  isPending = false,
  patientName,
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

  const showPricing = listAmountCents != null

  function resetFields() {
    setMethod("pix_manual")
    setDiscount(clampDiscount(discountPercent))
    setOverrideBrl("")
  }

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
        if (!next) resetFields()
        onOpenChange(next)
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-5 py-1">
          {(patientName || serviceName || billingKind !== "standard") && (
            <div className="flex flex-col gap-1 text-sm">
              {patientName ? (
                <p className="wrap-anywhere font-medium text-foreground">
                  {patientName}
                </p>
              ) : null}
              {serviceName ? (
                <p className="text-muted-foreground">{serviceName}</p>
              ) : null}
              {billingKind !== "standard" ? (
                <p className="text-muted-foreground">
                  {BILLING_KIND_LABELS[billingKind]} — sem cobrança
                </p>
              ) : null}
            </div>
          )}

          {showPricing ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Valor do serviço</span>
                <span className="tabular-nums text-foreground">
                  {formatCentsToBrl(listAmountCents)}
                </span>
              </div>

              {!isZeroKind ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      className="text-sm font-medium text-foreground"
                      htmlFor="mark-paid-discount"
                    >
                      Desconto no valor
                    </label>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {discount}%
                    </span>
                  </div>
                  <Slider
                    id="mark-paid-discount"
                    min={0}
                    max={100}
                    step={5}
                    value={[discount]}
                    disabled={isPending}
                    onValueChange={([value]) =>
                      setDiscount(clampDiscount(value ?? 0))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    {DISCOUNT_PRESETS.map((preset) => {
                      const isSelected = discount === preset
                      return (
                        <Button
                          key={preset}
                          type="button"
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          disabled={isPending}
                          aria-pressed={isSelected}
                          onClick={() => setDiscount(preset)}
                        >
                          {preset}%
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
                <span className="text-sm font-medium text-foreground">
                  Total a receber
                </span>
                <span className="text-base font-semibold tabular-nums text-foreground">
                  {finalAmountCents != null
                    ? formatCentsToBrl(finalAmountCents)
                    : "—"}
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="mark-paid-method"
            >
              Como pagou?
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

          {canManage && !isZeroKind && listAmountCents != null ? (
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="mark-paid-override"
              >
                Outro valor
              </label>
              <Input
                id="mark-paid-override"
                inputMode="decimal"
                placeholder="Opcional — ex.: 150,00"
                value={overrideBrl}
                disabled={isPending}
                onChange={(event) => setOverrideBrl(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use só se o valor cobrado for diferente do calculado com
                desconto.
              </p>
            </div>
          ) : null}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button type="button" disabled={isPending} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
