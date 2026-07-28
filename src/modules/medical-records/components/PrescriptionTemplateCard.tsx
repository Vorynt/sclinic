"use client"

import {
  PencilSimpleIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { PrescriptionLivePreview } from "@/modules/medical-records/components/PrescriptionLivePreview"
import type { PrescriptionLayout } from "@/modules/medical-records/types/prescription"

const SAMPLE_CLINIC = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Clínica Exemplo",
  document: "12.345.678/0001-90",
  addressLine: "Rua das Flores, 100",
  phone: "(11) 99999-0000",
  email: "contato@clinica.exemplo",
}

const SAMPLE_PATIENT = {
  id: "00000000-0000-4000-8000-000000000002",
  name: "Maria Silva",
  document: "123.456.789-00",
}

const SAMPLE_PROFESSIONAL = {
  id: "00000000-0000-4000-8000-000000000003",
  name: "Dr. João Souza",
  councilType: "CRM",
  councilNumber: "12345",
  councilState: "SP",
  specialty: "Clínica Geral",
}

function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

type PrescriptionTemplateCardProps = {
  template: PrescriptionLayout
  busy?: boolean
  onEdit: () => void
  onDelete: () => void
  onSetDefault?: () => void
}

export function PrescriptionTemplateCard({
  template,
  busy,
  onEdit,
  onDelete,
  onSetDefault,
}: PrescriptionTemplateCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-neutral-100/80 p-3">
        <PrescriptionLivePreview
          layoutHtml={template.html}
          body="<p>Dipirona 500 mg — 1 cp 6/6h se dor.</p>"
          clinic={SAMPLE_CLINIC}
          patient={SAMPLE_PATIENT}
          professional={SAMPLE_PROFESSIONAL}
          className="max-h-56 overflow-hidden border-0 bg-transparent"
          scale={0.28}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex flex-col gap-1">
            <h3 className="truncate font-heading text-base font-semibold tracking-tight">
              {template.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Atualizado em {formatUpdatedAt(template.updatedAt)}
            </p>
          </div>
          {template.isDefault ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-800">
              <StarIcon className="size-3.5" weight="fill" />
              Padrão
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onEdit}
          >
            <PencilSimpleIcon className="size-3.5" />
            Editar
          </Button>
          {!template.isDefault && onSetDefault ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={onSetDefault}
            >
              <StarIcon className="size-3.5" />
              Tornar padrão
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={busy}
            onClick={onDelete}
          >
            <TrashIcon className="size-3.5" />
            Excluir
          </Button>
        </div>
      </div>
    </article>
  )
}
