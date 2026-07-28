"use client";

import { EyeIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PrescriptionBodyEditor } from "@/modules/medical-records/components/PrescriptionBodyEditor";
import { PrescriptionLivePreview } from "@/modules/medical-records/components/PrescriptionLivePreview";
import type {
  Prescription,
  PrescriptionPreviewContext,
} from "@/modules/medical-records/types/prescription";

type PrescriptionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: PrescriptionPreviewContext;
  /** When set, dialog edits an existing draft. */
  prescription: Prescription | null;
  isSaving: boolean;
  isIssuing: boolean;
  onSaveDraft: (input: { body: string; plainText: string }) => void;
  onIssue: (input: { body: string; plainText: string }) => void;
};

export function PrescriptionFormDialog({
  open,
  onOpenChange,
  preview,
  prescription,
  isSaving,
  isIssuing,
  onSaveDraft,
  onIssue,
}: PrescriptionFormDialogProps) {
  const isEdit = Boolean(prescription);
  const formKey = open ? (prescription?.id ?? "new") : null;

  const [body, setBody] = useState(prescription?.body ?? "");
  const [plainText, setPlainText] = useState(prescription?.plainText ?? "");
  const [mobileTab, setMobileTab] = useState("write");
  const [loadedKey, setLoadedKey] = useState<string | null>(formKey);

  if (formKey !== loadedKey) {
    setLoadedKey(formKey);
    if (formKey !== null) {
      setBody(prescription?.body ?? "");
      setPlainText(prescription?.plainText ?? "");
      setMobileTab("write");
    }
  }

  const canSubmit = plainText.trim().length > 0;
  const busy = isSaving || isIssuing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex h-[min(90vh,760px)] w-full flex-col gap-0 overflow-hidden p-0",
          "max-w-[calc(100%-1rem)] sm:max-w-4xl",
        )}>
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border px-5 py-4 pr-12 text-left">
          <DialogTitle>
            {isEdit ? "Editar receita" : "Nova receita"}
          </DialogTitle>
          <DialogDescription>
            Escreva o conteúdo e confira o preview antes de salvar ou emitir.
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
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-2">
          <div
            className={cn(
              "h-full min-h-0 flex-col gap-3 overflow-y-auto border-border p-5 md:flex md:border-r",
              mobileTab === "write" ? "flex" : "hidden",
            )}>
            <p className="hidden text-xs font-medium text-muted-foreground uppercase md:block">
              Conteúdo
            </p>
            <PrescriptionBodyEditor
              key={formKey ?? "closed"}
              initialHtml={prescription?.body ?? ""}
              editable={!busy}
              onChange={(nextHtml, nextText) => {
                setBody(nextHtml);
                setPlainText(nextText);
              }}
            />
          </div>

          <div
            className={cn(
              "h-full min-h-0 flex-col gap-3 overflow-y-auto bg-muted/40 p-5 md:flex",
              mobileTab === "preview" ? "flex" : "hidden",
            )}>
            <p className="hidden text-xs font-medium text-muted-foreground uppercase md:block">
              Preview da impressão
            </p>
            <PrescriptionLivePreview
              layoutHtml={preview.layoutHtml}
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
            onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={busy || !canSubmit}
              onClick={() => onSaveDraft({ body, plainText })}>
              {isSaving ? <Spinner data-icon="inline-start" /> : null}
              Salvar rascunho
            </Button>
            <Button
              type="button"
              disabled={busy || !canSubmit}
              onClick={() => onIssue({ body, plainText })}>
              {isIssuing ? <Spinner data-icon="inline-start" /> : null}
              Emitir receita
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
