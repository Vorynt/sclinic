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
import { Textarea } from "@/components/ui/textarea"
import type { Prescription } from "@/modules/medical-records/types/prescription"

const formSchema = z.object({
  examsText: z
    .string()
    .trim()
    .min(1, "Informe ao menos um exame (um por linha).")
    .max(10_000, "Lista de exames muito longa."),
  notes: z
    .string()
    .trim()
    .max(1000, "Indicação clínica deve ter no máximo 1000 caracteres.")
    .optional()
    .or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

type ExamRequestFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prescription: Prescription | null
  isSaving: boolean
  isIssuing: boolean
  onSaveDraft: (input: { examsText: string; notes: string | null }) => void
  onIssue: (input: { examsText: string; notes: string | null }) => void
}

function examsTextFromPrescription(prescription: Prescription | null): string {
  const exams = prescription?.metadata?.exams
  if (!Array.isArray(exams)) return ""
  return exams
    .filter((item): item is string => typeof item === "string")
    .join("\n")
}

function notesFromPrescription(prescription: Prescription | null): string {
  const raw = prescription?.metadata?.notes
  return typeof raw === "string" ? raw : ""
}

export function ExamRequestFormDialog({
  open,
  onOpenChange,
  prescription,
  isSaving,
  isIssuing,
  onSaveDraft,
  onIssue,
}: ExamRequestFormDialogProps) {
  const isEdit = Boolean(prescription)
  const busy = isSaving || isIssuing

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examsText: examsTextFromPrescription(prescription),
      notes: notesFromPrescription(prescription),
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      examsText: examsTextFromPrescription(prescription),
      notes: notesFromPrescription(prescription),
    })
  }, [open, prescription, reset])

  function normalize(values: FormValues) {
    return {
      examsText: values.examsText.trim(),
      notes: values.notes?.trim() || null,
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar solicitação de exames" : "Solicitação de exames"}
          </DialogTitle>
          <DialogDescription>
            Informe um exame por linha. O documento é gerado automaticamente com
            os dados do paciente.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => {
            onIssue(normalize(values))
          })}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.examsText) || undefined}>
              <FieldLabel htmlFor="exam-request-exams">Exames</FieldLabel>
              <Textarea
                id="exam-request-exams"
                rows={6}
                placeholder={"Hemograma completo\nGlicemia de jejum\nTSH"}
                disabled={busy}
                aria-invalid={Boolean(errors.examsText) || undefined}
                {...register("examsText")}
              />
              <FieldError errors={[errors.examsText]} />
            </Field>

            <Field data-invalid={Boolean(errors.notes) || undefined}>
              <FieldLabel htmlFor="exam-request-notes">
                Indicação clínica (opcional)
              </FieldLabel>
              <Textarea
                id="exam-request-notes"
                rows={3}
                placeholder="Ex.: investigação de anemia, controle de diabetes…"
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
