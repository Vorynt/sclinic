"use client"

import { useState } from "react"
import { toast } from "sonner"

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
import { Label } from "@/components/ui/label"
import { MaskedInput } from "@/components/ui/masked-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  CHARGE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/billing/constants/charges"
import {
  useCreateChargeFromAppointmentMutation,
  useMarkChargePaidMutation,
} from "@/modules/billing/hooks/use-charge-mutations"
import { useChargeByAppointmentQuery } from "@/modules/billing/hooks/use-charges"
import { MANUAL_PAYMENT_METHODS } from "@/modules/billing/schemas/charge.schema"
import type { ManualPaymentMethod } from "@/modules/billing/types/charge"
import {
  formatCentsToBrl,
  isEmptyMoneyInput,
  parseBrlToCents,
} from "@/modules/billing/utils/money"

type CompleteAttendancePaymentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  canCollect: boolean
  isCompleting: boolean
  onComplete: () => Promise<void> | void
  onAfterComplete: () => void
}

/**
 * Pre-complete dialog: optionally create/mark charge paid, then complete attendance.
 * Completion always runs first when confirmed; payment failures only warn.
 */
export function CompleteAttendancePaymentDialog({
  open,
  onOpenChange,
  appointmentId,
  canCollect,
  isCompleting,
  onComplete,
  onAfterComplete,
}: CompleteAttendancePaymentDialogProps) {
  const chargeQuery = useChargeByAppointmentQuery(
    appointmentId,
    open && canCollect,
  )
  const [amountInput, setAmountInput] = useState("")
  const [method, setMethod] = useState<ManualPaymentMethod>("pix_manual")
  const [submitting, setSubmitting] = useState(false)

  const createCharge = useCreateChargeFromAppointmentMutation()
  const markPaid = useMarkChargePaidMutation()

  const charge = chargeQuery.data
  const isBusy =
    submitting ||
    isCompleting ||
    createCharge.isPending ||
    markPaid.isPending ||
    (canCollect && chargeQuery.isLoading)

  async function finishAttendance(options: {
    createAmountCents?: number
    markPaid?: boolean
  }) {
    setSubmitting(true)
    try {
      await onComplete()

      if (canCollect) {
        try {
          let chargeId = charge?.id
          let status = charge?.status

          if (options.createAmountCents != null && !chargeId) {
            const created = await createCharge.mutateAsync({
              appointmentId,
              amountCents: options.createAmountCents,
            })
            chargeId = created.id
            status = created.status
          }

          if (options.markPaid && chargeId && status === "pending") {
            await markPaid.mutateAsync({
              chargeId,
              method,
            })
            toast.success("Pagamento registrado")
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Não foi possível registrar o pagamento."
          toast.warning(
            `Atendimento concluído, mas o pagamento falhou: ${message}`,
          )
        }
      }

      onOpenChange(false)
      onAfterComplete()
    } finally {
      setSubmitting(false)
      setAmountInput("")
      setMethod("pix_manual")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Concluir atendimento</AlertDialogTitle>
          <AlertDialogDescription>
            {canCollect
              ? "Você pode registrar a cobrança agora ou concluir sem pagamento."
              : "Confirme para marcar o atendimento como concluído."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {canCollect ? (
          <div className="flex flex-col gap-3 py-1">
            {chargeQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : charge ? (
              <p className="text-sm text-muted-foreground">
                Cobrança: {formatCentsToBrl(charge.amountCents)} ·{" "}
                {CHARGE_STATUS_LABELS[charge.status] ?? charge.status}
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="complete-charge-amount">
                  Valor da consulta — opcional
                </Label>
                <MaskedInput
                  key={open ? "amount-open" : "amount-closed"}
                  id="complete-charge-amount"
                  mask="currency"
                  placeholder="R$ 0,00"
                  onChange={(event) => setAmountInput(event.target.value)}
                  disabled={isBusy}
                />
              </div>
            )}

            {(charge?.status === "pending" ||
              (!charge && !isEmptyMoneyInput(amountInput))) && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="complete-pay-method">Forma de pagamento</Label>
                <Select
                  value={method}
                  onValueChange={(value) =>
                    setMethod(value as ManualPaymentMethod)
                  }
                  disabled={isBusy}
                >
                  <SelectTrigger id="complete-pay-method">
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
            )}
          </div>
        ) : null}

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel disabled={isBusy}>Voltar</AlertDialogCancel>
          {canCollect && charge?.status === "pending" ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => void finishAttendance({})}
              >
                {isBusy ? <Spinner /> : null}
                Concluir sem registrar
              </Button>
              <Button
                type="button"
                disabled={isBusy}
                onClick={() => void finishAttendance({ markPaid: true })}
              >
                {isBusy ? <Spinner /> : null}
                Concluir e registrar pagamento
              </Button>
            </>
          ) : canCollect && !charge ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => void finishAttendance({})}
              >
                {isBusy ? <Spinner /> : null}
                Concluir sem cobrança
              </Button>
              {amountInput.trim().length > 0 &&
              !isEmptyMoneyInput(amountInput) ? (
                <Button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    const amountCents = parseBrlToCents(amountInput)
                    if (amountCents == null) {
                      toast.error("Informe um valor válido maior que zero.")
                      return
                    }
                    void finishAttendance({
                      createAmountCents: amountCents,
                      markPaid: true,
                    })
                  }}
                >
                  {isBusy ? <Spinner /> : null}
                  Concluir e registrar pagamento
                </Button>
              ) : null}
            </>
          ) : (
            <Button
              type="button"
              disabled={isBusy}
              onClick={() => void finishAttendance({})}
            >
              {isBusy ? <Spinner /> : null}
              Concluir
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
