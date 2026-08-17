"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Prescription } from "@/modules/medical-records/types/prescription"

const formSchema = z.object({
  daysOff: z
    .number({ error: "Informe um número inteiro de dias." })
    .int("Informe um número inteiro de dias.")
    .min(1, "Informe ao menos 1 dia de afastamento.")
    .max(365, "O afastamento não pode exceder 365 dias."),
  cid: z
    .string()
    .trim()
    .max(10, "CID deve ter no máximo 10 caracteres.")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "Observações devem ter no máximo 1000 caracteres.")
    .optional()
    .or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

type MedicalCertificateFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prescription: Prescription | null
  isSaving: boolean
  isIssuing: boolean
  onSaveDraft: (input: {
    daysOff: number
    cid: string | null
    notes: string | null
  }) => void
  onIssue: (input: {
    daysOff: number
    cid: string | null
    notes: string | null
  }) => void
}

function valuesFromPrescription(
  prescription: Prescription | null,
): FormValues {
  const metadata = prescription?.metadata
  return {
    daysOff:
      typeof metadata?.daysOff === "number" && metadata.daysOff > 0
        ? metadata.daysOff
        : 1,
    cid: typeof metadata?.cid === "string" ? metadata.cid : "",
    notes: typeof metadata?.notes === "string" ? metadata.notes : "",
  }
}

export function MedicalCertificateFormDialog({
  open,
  onOpenChange,
  prescription,
  isSaving,
  isIssuing,
  onSaveDraft,
  onIssue,
}: MedicalCertificateFormDialogProps) {
  const isEdit = Boolean(prescription)
  const busy = isSaving || isIssuing

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: valuesFromPrescription(prescription),
  })

  useEffect(() => {
    if (!open) return
    reset(valuesFromPrescription(prescription))
  }, [open, prescription, reset])

  function normalize(values: FormValues) {
    return {
      daysOff: values.daysOff,
      cid: values.cid?.trim() || null,
      notes: values.notes?.trim() || null,
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar atestado médico" : "Atestado médico"}
          </DialogTitle>
          <DialogDescription>
            O texto é gerado automaticamente com paciente e dias de afastamento.
            CID e observações são opcionais.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => {
            onIssue(normalize(values))
          })}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.daysOff) || undefined}>
              <FieldLabel htmlFor="medical-certificate-days-off">
                Dias de afastamento
              </FieldLabel>
              <Input
                id="medical-certificate-days-off"
                type="number"
                min={1}
                max={365}
                disabled={busy}
                aria-invalid={Boolean(errors.daysOff) || undefined}
                {...register("daysOff", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.daysOff]} />
            </Field>

            <Field data-invalid={Boolean(errors.cid) || undefined}>
              <FieldLabel htmlFor="medical-certificate-cid">
                CID (opcional)
              </FieldLabel>
              <Input
                id="medical-certificate-cid"
                placeholder="Ex.: J06.9"
                disabled={busy}
                aria-invalid={Boolean(errors.cid) || undefined}
                {...register("cid")}
              />
              <FieldError errors={[errors.cid]} />
            </Field>

            <Field data-invalid={Boolean(errors.notes) || undefined}>
              <FieldLabel htmlFor="medical-certificate-notes">
                Observações (opcional)
              </FieldLabel>
              <Textarea
                id="medical-certificate-notes"
                rows={3}
                placeholder="Ex.: repouso absoluto, retorno se piora…"
                disabled={busy}
                aria-invalid={Boolean(errors.notes) || undefined}
                {...register("notes")}
              />
              <FieldError errors={[errors.notes]} />
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={handleSubmit((values) => {
                onSaveDraft(normalize(values))
              })}
            >
              {isSaving ? "Salvando…" : "Salvar rascunho"}
            </Button>
            <Button type="submit" disabled={busy}>
              {isIssuing ? "Emitindo…" : "Emitir e imprimir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
