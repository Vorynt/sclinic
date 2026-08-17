"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  CalendarCheckIcon,
  ClipboardTextIcon,
  FileTextIcon,
  PillIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ClinicalDocumentKind } from "@/modules/medical-records/constants/clinical-documents";
import { clinicalDocumentKindLabel } from "@/modules/medical-records/constants/clinical-documents";

export type NewClinicalDocumentKind = Extract<
  ClinicalDocumentKind,
  | "prescription"
  | "attendance_declaration"
  | "medical_certificate"
  | "exam_request"
>;

type DocumentOption = {
  kind: NewClinicalDocumentKind;
  icon: Icon;
  description: string;
};

const DOCUMENT_OPTIONS: DocumentOption[] = [
  {
    kind: "prescription",
    icon: PillIcon,
    description:
      "Medicamentos e orientações farmacológicas com timbrado da clínica.",
  },
  {
    kind: "attendance_declaration",
    icon: CalendarCheckIcon,
    description: "Comprovante de presença sem recomendação de afastamento.",
  },
  {
    kind: "medical_certificate",
    icon: FileTextIcon,
    description:
      "Atestado de afastamento com dias, CID e observações opcionais.",
  },
  {
    kind: "exam_request",
    icon: ClipboardTextIcon,
    description: "Pedido estruturado de exames complementares.",
  },
];

type NewClinicalDocumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (kind: NewClinicalDocumentKind) => void;
};

export function NewClinicalDocumentDialog({
  open,
  onOpenChange,
  onSelect,
}: NewClinicalDocumentDialogProps) {
  const [selectedKind, setSelectedKind] =
    useState<NewClinicalDocumentKind | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedKind(null);
    }
  }, [open]);

  function handleConfirm() {
    if (!selectedKind) return;
    onSelect(selectedKind);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo documento</DialogTitle>
          <DialogDescription>
            Escolha o tipo de documento que deseja emitir neste atendimento.
          </DialogDescription>
        </DialogHeader>

        <ul
          className="flex flex-col gap-2"
          role="radiogroup"
          aria-label="Tipos de documento">
          {DOCUMENT_OPTIONS.map((option) => {
            const IconComponent = option.icon;
            const label = clinicalDocumentKindLabel(option.kind);
            const isSelected = selectedKind === option.kind;

            return (
              <li key={option.kind}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedKind(option.kind)}
                  className={cn(
                    "flex w-full gap-3 rounded-xl border p-4 text-left transition-colors",
                    "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-background",
                  )}>
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}>
                    <IconComponent className="size-5" weight="duotone" />
                  </span>
                  <span className="min-w-0 flex flex-col gap-1">
                    <span className="font-medium text-foreground">{label}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!selectedKind}
            onClick={handleConfirm}>
            Selecionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
