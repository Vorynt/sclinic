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
  notes: z
    .string()
    .trim()
    .max(1000, "Observações devem ter no máximo 1000 caracteres.")
    .optional()
    .or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

type AttendanceDeclarationFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prescription: Prescription | null
  isSaving: boolean
  isIssuing: boolean
  onSaveDraft: (input: { notes: string | null }) => void
  onIssue: (input: { notes: string | null }) => void
}

function notesFromPrescription(prescription: Prescription | null): string {
  const raw = prescription?.metadata?.notes
  return typeof raw === "string" ? raw : ""
}

export function AttendanceDeclarationFormDialog({
  open,
  onOpenChange,
  prescription,
  isSaving,
  isIssuing,
  onSaveDraft,
  onIssue,
}: AttendanceDeclarationFormDialogProps) {
  const isEdit = Boolean(prescription)
  const busy = isSaving || isIssuing

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { notes: notesFromPrescription(prescription) },
  })

  useEffect(() => {
    if (!open) return
    reset({ notes: notesFromPrescription(prescription) })
  }, [open, prescription, reset])

  function normalizeNotes(values: FormValues): string | null {
    return values.notes?.trim() || null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Editar declaração de comparecimento"
              : "Declaração de comparecimento"}
          </DialogTitle>
          <DialogDescription>
            O texto é gerado automaticamente com paciente, data do atendimento e
            profissional. Observações são opcionais.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => {
            onIssue({ notes: normalizeNotes(values) })
          })}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.notes) || undefined}>
              <FieldLabel htmlFor="attendance-declaration-notes">
                Observações (opcional)
              </FieldLabel>
              <Textarea
                id="attendance-declaration-notes"
                rows={4}
                placeholder="Ex.: compareceu acompanhado, horário de chegada…"
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
                onSaveDraft({ notes: normalizeNotes(values) })
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
