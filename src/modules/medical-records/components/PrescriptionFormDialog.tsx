"use client"

import { EyeIcon, PencilSimpleIcon } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PrescriptionBodyEditor } from "@/modules/medical-records/components/PrescriptionBodyEditor"
import { PrescriptionLivePreview } from "@/modules/medical-records/components/PrescriptionLivePreview"
import type {
  Prescription,
  PrescriptionPreviewContext,
  PrescriptionTemplateOption,
} from "@/modules/medical-records/types/prescription"

export type PrescriptionFormSubmitInput = {
  body: string
  plainText: string
  layoutId: string | null
}

type PrescriptionFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  preview: PrescriptionPreviewContext
  templates: PrescriptionTemplateOption[]
  /** When set, dialog edits an existing draft. */
  prescription: Prescription | null
  isSaving: boolean
  isIssuing: boolean
  onSaveDraft: (input: PrescriptionFormSubmitInput) => void
  onIssue: (input: PrescriptionFormSubmitInput) => void
}

function resolveInitialLayoutId(
  prescription: Prescription | null,
  templates: PrescriptionTemplateOption[],
): string | null {
  if (prescription?.layoutId) return prescription.layoutId
  const defaultTemplate = templates.find((t) => t.isDefault) ?? templates[0]
  return defaultTemplate?.id ?? null
}

export function PrescriptionFormDialog({
  open,
  onOpenChange,
  preview,
  templates,
  prescription,
  isSaving,
  isIssuing,
  onSaveDraft,
  onIssue,
}: PrescriptionFormDialogProps) {
  const isEdit = Boolean(prescription)
  const formKey = open ? (prescription?.id ?? "new") : null

  const [body, setBody] = useState(prescription?.body ?? "")
  const [plainText, setPlainText] = useState(prescription?.plainText ?? "")
  const [layoutId, setLayoutId] = useState<string | null>(() =>
    resolveInitialLayoutId(prescription, templates),
  )
  const [mobileTab, setMobileTab] = useState("write")
  const [loadedKey, setLoadedKey] = useState<string | null>(formKey)

  if (formKey !== loadedKey) {
    setLoadedKey(formKey)
    if (formKey !== null) {
      setBody(prescription?.body ?? "")
      setPlainText(prescription?.plainText ?? "")
      setLayoutId(resolveInitialLayoutId(prescription, templates))
      setMobileTab("write")
    }
  }

  const layoutHtml = useMemo(() => {
    if (!layoutId) return preview.layoutHtml
    return (
      templates.find((t) => t.id === layoutId)?.html ?? preview.layoutHtml
    )
  }, [layoutId, templates, preview.layoutHtml])

  const showTemplatePicker = templates.length > 1
  const canSubmit = plainText.trim().length > 0
  const busy = isSaving || isIssuing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex h-[min(90vh,760px)] w-full flex-col gap-0 overflow-hidden p-0",
          "max-w-[calc(100%-1rem)] sm:max-w-4xl",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border px-5 py-4 pr-12 text-left">
          <DialogTitle>
            {isEdit ? "Editar receita" : "Nova receita"}
          </DialogTitle>
          <DialogDescription>
            Escreva o conteúdo e confira a visualização antes de salvar ou
            emitir.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 border-b border-border px-5 py-2 md:hidden">
          <Tabs value={mobileTab} onValueChange={setMobileTab}>
            <TabsList variant="default" className="w-full">
              <TabsTrigger value="write" className="flex-1 gap-1.5">
                <PencilSimpleIcon />
                Escrever
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 gap-1.5">
                <EyeIcon />
                Visualizar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-2">
          <div
            className={cn(
              "h-full min-h-0 flex-col gap-3 overflow-y-auto border-border p-5 md:flex md:border-r",
              mobileTab === "write" ? "flex" : "hidden",
            )}
          >
            {showTemplatePicker ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rx-template">Modelo de receita</Label>
                <Select
                  value={layoutId ?? undefined}
                  onValueChange={(value) => setLayoutId(value)}
                  disabled={busy}
                >
                  <SelectTrigger id="rx-template" className="w-full">
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                        {template.isDefault ? " (padrão)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <p className="hidden text-xs font-medium text-muted-foreground uppercase md:block">
              Conteúdo
            </p>
            <PrescriptionBodyEditor
              key={formKey ?? "closed"}
              initialHtml={prescription?.body ?? ""}
              editable={!busy}
              onChange={(nextHtml, nextText) => {
                setBody(nextHtml)
                setPlainText(nextText)
              }}
            />
          </div>

          <div
            className={cn(
              "h-full min-h-0 flex-col gap-3 overflow-y-auto bg-muted/40 p-5 md:flex",
              mobileTab === "preview" ? "flex" : "hidden",
            )}
          >
            <p className="hidden text-xs font-medium text-muted-foreground uppercase md:block">
              Como fica na impressão
            </p>
            <PrescriptionLivePreview
              layoutHtml={layoutHtml}
              body={body}
              clinic={preview.clinic}
              patient={preview.patient}
              professional={preview.professional}
              className="h-full min-h-90 flex-1"
              scale={0.4}
            />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t border-border bg-muted/40 p-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={busy || !canSubmit}
              onClick={() => onSaveDraft({ body, plainText, layoutId })}
            >
              {isSaving ? <Spinner data-icon="inline-start" /> : null}
              Salvar rascunho
            </Button>
            <Button
              type="button"
              disabled={busy || !canSubmit}
              onClick={() => onIssue({ body, plainText, layoutId })}
            >
              {isIssuing ? <Spinner data-icon="inline-start" /> : null}
              Emitir receita
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
