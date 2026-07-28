"use client"

import { StarIcon } from "@phosphor-icons/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { TemplateBlockEditor } from "@/modules/medical-records/prescription-template-designer/components/TemplateBlockEditor"
import {
  DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
  prescriptionDocumentModelSchema,
  type PrescriptionDocumentModel,
} from "@/modules/medical-records/prescription-template-designer"
import type { PrescriptionLayout } from "@/modules/medical-records/types/prescription"

export type PrescriptionTemplateEditorDraft = {
  id: string | null
  name: string
  model: PrescriptionDocumentModel
  isDefault: boolean
}

type PrescriptionTemplateEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = create mode */
  template: PrescriptionLayout | null
  suggestedName?: string
  isSaving: boolean
  isSettingDefault?: boolean
  onSave: (draft: PrescriptionTemplateEditorDraft) => void
  onSetDefault?: (id: string) => void
}

function toDraft(
  template: PrescriptionLayout | null,
  suggestedName = "Novo modelo",
): PrescriptionTemplateEditorDraft {
  if (template) {
    return {
      id: template.id,
      name: template.name,
      model: structuredClone(template.documentModel),
      isDefault: template.isDefault,
    }
  }
  return {
    id: null,
    name: suggestedName,
    model: structuredClone(DEFAULT_PRESCRIPTION_DOCUMENT_MODEL),
    isDefault: false,
  }
}

export function PrescriptionTemplateEditorDialog({
  open,
  onOpenChange,
  template,
  suggestedName,
  isSaving,
  isSettingDefault,
  onSave,
  onSetDefault,
}: PrescriptionTemplateEditorDialogProps) {
  const isEdit = Boolean(template)
  const formKey = open ? (template?.id ?? "new") : null

  const [draft, setDraft] = useState<PrescriptionTemplateEditorDraft>(() =>
    toDraft(template, suggestedName),
  )
  const [loadedKey, setLoadedKey] = useState<string | null>(formKey)
  const [validationError, setValidationError] = useState<string | null>(null)

  if (formKey !== loadedKey) {
    setLoadedKey(formKey)
    setValidationError(null)
    if (formKey !== null) {
      setDraft(toDraft(template, suggestedName))
    }
  }

  const busy = isSaving || Boolean(isSettingDefault)

  function handleSave() {
    const name = draft.name.trim()
    if (!name) {
      setValidationError("Informe o nome do modelo.")
      return
    }
    const parsed = prescriptionDocumentModelSchema.safeParse(draft.model)
    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message ?? "Não foi possível validar o modelo.",
      )
      return
    }
    setValidationError(null)
    onSave({
      ...draft,
      name,
      model: parsed.data,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex h-[min(96vh,920px)] w-full flex-col gap-0 overflow-hidden p-0",
          "max-w-[calc(100%-1rem)] sm:max-w-[min(1200px,calc(100%-2rem))]",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border px-5 py-4 pr-12 text-left">
          <DialogTitle>
            {isEdit ? "Editar modelo de receita" : "Novo modelo de receita"}
          </DialogTitle>
          <DialogDescription>
            Monte o cabeçalho e a estrutura da folha com blocos. A visualização
            ao lado mostra como a receita sai na impressão.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <TemplateBlockEditor
            key={formKey ?? "closed"}
            name={draft.name}
            onNameChange={(name) => setDraft((prev) => ({ ...prev, name }))}
            model={draft.model}
            onModelChange={(model) => setDraft((prev) => ({ ...prev, model }))}
          />
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 flex-col gap-3 rounded-none border-t border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            {validationError ? (
              <p className="text-sm text-destructive">{validationError}</p>
            ) : null}
          </div>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            {isEdit && template && !template.isDefault && onSetDefault ? (
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => onSetDefault(template.id)}
              >
                {isSettingDefault ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <StarIcon className="size-3.5" />
                )}
                Definir como padrão
              </Button>
            ) : null}
            <Button type="button" disabled={busy} onClick={handleSave}>
              {isSaving ? <Spinner data-icon="inline-start" /> : null}
              {isEdit ? "Salvar modelo" : "Criar modelo"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
