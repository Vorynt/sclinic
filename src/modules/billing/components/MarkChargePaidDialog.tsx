"use client"

import { useState } from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAYMENT_METHOD_LABELS } from "@/modules/billing/constants/charges"
import { MANUAL_PAYMENT_METHODS } from "@/modules/billing/schemas/charge.schema"
import type { ManualPaymentMethod } from "@/modules/billing/types/charge"

type MarkChargePaidDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  isPending?: boolean
  onConfirm: (method: ManualPaymentMethod) => void
}

export function MarkChargePaidDialog({
  open,
  onOpenChange,
  title = "Registrar pagamento",
  description,
  confirmLabel = "Confirmar",
  isPending = false,
  onConfirm,
}: MarkChargePaidDialogProps) {
  const [method, setMethod] = useState<ManualPaymentMethod>("pix_manual")

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setMethod("pix_manual")
        onOpenChange(next)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Voltar</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => onConfirm(method)}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
