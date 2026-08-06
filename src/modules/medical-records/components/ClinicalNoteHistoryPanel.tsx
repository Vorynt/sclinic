"use client"

import { CaretDownIcon } from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { ClinicalNoteEditor } from "@/modules/medical-records/components/ClinicalNoteEditor"
import type { ClinicalNote } from "@/modules/medical-records/types/clinical-note"

type ClinicalNoteHistoryPanelProps = {
  notes: ClinicalNote[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  isRetrying?: boolean
  title?: string
  description?: string
  emptyMessage?: string
}

export function ClinicalNoteHistoryPanel({
  notes,
  isLoading,
  isError,
  onRetry,
  isRetrying = false,
  title = "Anotações anteriores",
  description = "Histórico clínico do paciente em outros atendimentos.",
  emptyMessage = "Nenhuma anotação anterior.",
}: ClinicalNoteHistoryPanelProps) {
  return (
    <aside className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : null}

      {isError ? (
        <QueryErrorState
          description="Não foi possível carregar o histórico."
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      ) : null}

      {!isLoading && !isError && notes && notes.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}

      {!isLoading && !isError && notes && notes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li key={note.id}>
              <ClinicalNoteHistoryItem note={note} />
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  )
}

function ClinicalNoteHistoryItem({ note }: { note: ClinicalNote }) {
  const [open, setOpen] = useState(false)

  const dateLabel = note.appointmentStartsAt
    ? format(note.appointmentStartsAt, "dd MMM yyyy · HH:mm", { locale: ptBR })
    : format(note.createdAt, "dd MMM yyyy · HH:mm", { locale: ptBR })

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-md border border-border"
    >
      <CollapsibleTrigger
        type="button"
        className="flex w-full items-start gap-2 px-3 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{dateLabel}</p>
          {note.professionalName ? (
            <p className="text-xs text-muted-foreground">
              {note.professionalName}
            </p>
          ) : null}
        </div>
        <CaretDownIcon
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
        <span className="sr-only">
          {open ? "Recolher anotação" : "Expandir anotação"}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-border px-1 pb-1 pt-0">
          {open ? (
            <ClinicalNoteEditor
              initialContent={note.content}
              editable={false}
              className="border-0 bg-transparent"
            />
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
