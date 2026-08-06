"use client"

import {
  EyeIcon,
  PencilSimpleIcon,
  PrinterIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { routes } from "@/config/routes"
import { clinicalDocumentKindLabel } from "@/modules/medical-records/constants/clinical-documents"
import type { Prescription } from "@/modules/medical-records/types/prescription"

type PrescriptionListItemProps = {
  prescription: Prescription
  /** Allow draft edit/delete (attendance in progress). */
  canEditDraft?: boolean
  isDeleting?: boolean
  onEditDraft?: (prescription: Prescription) => void
  onDeleteDraft?: (prescription: Prescription) => void
}

function formatWhen(date: Date | null | undefined): string | null {
  if (!date) return null
  return format(new Date(date), "dd MMM yyyy · HH:mm", { locale: ptBR })
}

function openView(id: string) {
  window.open(
    routes.prescriptionPrint(id, { autoPrint: false }),
    "_blank",
    "noopener,noreferrer",
  )
}

function openPrint(id: string) {
  window.open(routes.prescriptionPrint(id), "_blank", "noopener,noreferrer")
}

/**
 * Compact prescription row: status, who prescribed, when — no body content.
 * Issued: Ver + Imprimir. Draft (editable): Editar + Excluir.
 */
export function PrescriptionListItem({
  prescription,
  canEditDraft = false,
  isDeleting = false,
  onEditDraft,
  onDeleteDraft,
}: PrescriptionListItemProps) {
  const isIssued = prescription.status === "issued"
  const who =
    prescription.professionalSnapshot?.name ??
    prescription.professionalName ??
    null
  const whenLabel = isIssued
    ? formatWhen(prescription.issuedAt)
    : formatWhen(prescription.updatedAt ?? prescription.createdAt)

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
              isIssued
                ? "bg-emerald-50 text-emerald-800"
                : "bg-amber-50 text-amber-800",
            )}
          >
            {isIssued ? "Emitido" : "Rascunho"}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {clinicalDocumentKindLabel(prescription.kind)}
          </span>
        </div>
        <p className="text-sm text-foreground">
          <span className="text-muted-foreground">Por </span>
          <span className="font-medium">{who ?? "Profissional não informado"}</span>
        </p>
        {whenLabel ? (
          <p className="text-xs text-muted-foreground">
            {isIssued ? "Emitido em " : "Atualizado em "}
            {whenLabel}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {isIssued ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => openView(prescription.id)}
            >
              <EyeIcon />
              Ver
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => openPrint(prescription.id)}
            >
              <PrinterIcon />
              Imprimir
            </Button>
          </>
        ) : null}

        {!isIssued && canEditDraft ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onEditDraft?.(prescription)}
            >
              <PencilSimpleIcon />
              Editar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isDeleting}
              onClick={() => onDeleteDraft?.(prescription)}
            >
              <TrashIcon />
              Excluir
            </Button>
          </>
        ) : null}

        {!isIssued && !canEditDraft ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => openView(prescription.id)}
          >
            <EyeIcon />
            Ver
          </Button>
        ) : null}
      </div>
    </li>
  )
}
