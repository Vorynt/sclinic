"use client"

import type { JSONContent } from "@tiptap/react"
import { useState } from "react"
import { toast } from "sonner"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  ClinicalNoteEditor,
  EMPTY_DOC,
} from "@/modules/medical-records/components/ClinicalNoteEditor"
import { ClinicalNoteFormRenderer } from "@/modules/medical-records/components/ClinicalNoteFormRenderer"
import { ClinicalNoteHistoryPanel } from "@/modules/medical-records/components/ClinicalNoteHistoryPanel"
import {
  CLINICAL_NOTE_TEMPLATES,
  getClinicalNoteTemplate,
  type ClinicalNoteTemplateId,
} from "@/modules/medical-records/constants/clinical-note-templates"
import { useUpsertClinicalNoteMutation } from "@/modules/medical-records/hooks/use-clinical-note-mutations"
import {
  useClinicalNoteForAppointmentQuery,
  usePatientClinicalNotesQuery,
} from "@/modules/medical-records/hooks/use-clinical-notes"
import type {
  ClinicalNote,
  ClinicalNoteForAppointment,
} from "@/modules/medical-records/types/clinical-note"
import { LockIcon } from "@phosphor-icons/react"

type ClinicalNotesPanelProps = {
  appointmentId: string
}

export function ClinicalNotesPanel({ appointmentId }: ClinicalNotesPanelProps) {
  const noteQuery = useClinicalNoteForAppointmentQuery(appointmentId)
  const historyQuery = usePatientClinicalNotesQuery(
    {
      patientId: noteQuery.data?.patientId ?? "",
      excludeAppointmentId: appointmentId,
    },
    Boolean(noteQuery.data?.patientId),
  )

  if (noteQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (noteQuery.isError || !noteQuery.data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar as anotações."
        onRetry={() => {
          void noteQuery.refetch()
        }}
        isRetrying={noteQuery.isFetching}
      />
    )
  }

  return (
    <ClinicalNotesPanelContent
      key={appointmentId}
      appointmentId={appointmentId}
      data={noteQuery.data}
      historyNotes={historyQuery.data}
      historyLoading={historyQuery.isLoading}
      historyError={historyQuery.isError}
      onHistoryRetry={() => {
        void historyQuery.refetch()
      }}
      historyRetrying={historyQuery.isFetching}
    />
  )
}

type ClinicalNotesPanelContentProps = {
  appointmentId: string
  data: ClinicalNoteForAppointment
  historyNotes: ClinicalNote[] | undefined
  historyLoading: boolean
  historyError: boolean
  onHistoryRetry: () => void
  historyRetrying: boolean
}

function ClinicalNotesPanelContent({
  appointmentId,
  data,
  historyNotes,
  historyLoading,
  historyError,
  onHistoryRetry,
  historyRetrying,
}: ClinicalNotesPanelContentProps) {
  const note = data.note
  const isFormNote = Boolean(note?.templateId && note.formValues)
  const isLegacyTipTap = Boolean(note && !note.templateId)

  const [selectedTemplateId, setSelectedTemplateId] =
    useState<ClinicalNoteTemplateId | null>(
      () => note?.templateId ?? null,
    )
  const [pickingTemplate, setPickingTemplate] = useState(
    () => data.editable && !note,
  )

  const [content, setContent] = useState<JSONContent>(
    () => (note?.content as JSONContent | undefined) ?? EMPTY_DOC,
  )
  const [plainText, setPlainText] = useState(() => note?.plainText ?? "")

  const upsert = useUpsertClinicalNoteMutation({
    onSuccess: () => {
      toast.success("Anotação salva")
      setPickingTemplate(false)
    },
    onError: (error) => toast.error(error.message),
  })

  const editable = data.editable
  const hasNote = Boolean(note?.plainText.trim())
  const showEmptyReadonly = !editable && !hasNote

  const activeTemplate = selectedTemplateId
    ? getClinicalNoteTemplate(selectedTemplateId)
    : null

  const showForm =
    editable &&
    !pickingTemplate &&
    activeTemplate &&
    (!isLegacyTipTap || isFormNote || !note)

  const showLegacyEditor =
    (editable && isLegacyTipTap && !pickingTemplate && !isFormNote) ||
    (!editable && hasNote && !isFormNote)

  const showReadonlyForm =
    !editable && isFormNote && note?.templateId
      ? getClinicalNoteTemplate(note.templateId)
      : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Anotações
          </h2>
          <p className="text-sm text-muted-foreground">
            {editable
              ? "Preencha o formulário clínico ou edite uma anotação livre."
              : "Somente leitura — o atendimento não está em andamento."}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {showEmptyReadonly ? (
          <div className="flex min-h-80 items-center justify-center rounded-md border border-dashed border-border px-6 py-10">
            <div className="flex max-w-sm flex-col items-center gap-1 text-center">
              <p className="text-sm font-medium text-foreground">
                Nenhuma anotação neste atendimento
              </p>
              <p className="text-sm text-muted-foreground">
                Não há evolução clínica registrada para esta consulta.
              </p>
            </div>
          </div>
        ) : pickingTemplate && editable ? (
          <TemplatePicker
            onSelect={(id) => {
              setSelectedTemplateId(id)
              setPickingTemplate(false)
            }}
          />
        ) : showForm && activeTemplate ? (
          <div className="rounded-md border border-border p-4">
            <ClinicalNoteFormRenderer
              key={`${activeTemplate.id}-${note?.id ?? "new"}`}
              template={activeTemplate}
              initialValues={
                note?.templateId === activeTemplate.id
                  ? note.formValues
                  : undefined
              }
              editable={editable}
              isPending={upsert.isPending}
              onChangeTemplate={
                editable ? () => setPickingTemplate(true) : undefined
              }
              onSubmit={(formValues) =>
                upsert.mutate({
                  appointmentId,
                  templateId: activeTemplate.id,
                  formValues,
                })
              }
            />
          </div>
        ) : showReadonlyForm && note ? (
          <div className="rounded-md border border-border p-4">
            <ClinicalNoteFormRenderer
              template={showReadonlyForm}
              initialValues={note.formValues}
              editable={false}
              isPending={false}
              onSubmit={() => undefined}
            />
          </div>
        ) : showLegacyEditor ? (
          <div className="flex flex-col gap-4">
            <ClinicalNoteEditor
              key={note?.id ?? "legacy"}
              initialContent={content}
              editable={editable}
              onChange={(nextContent, nextPlainText) => {
                setContent(nextContent)
                setPlainText(nextPlainText)
              }}
            />
            {editable ? (
              <Button
                type="button"
                disabled={
                  upsert.isPending || plainText.trim().length === 0 || !editable
                }
                className="ml-auto"
                onClick={() =>
                  upsert.mutate({
                    appointmentId,
                    content: { ...content, type: "doc" },
                    plainText: plainText.trim(),
                  })
                }
              >
                {upsert.isPending ? <Spinner /> : null}
                {!editable ? <LockIcon /> : null}
                Salvar anotação
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="rounded-md border border-border">
            <ClinicalNoteEditor
              initialContent={(note?.content as JSONContent) ?? EMPTY_DOC}
              editable={false}
              className="border-0"
            />
          </div>
        )}

        <ClinicalNoteHistoryPanel
          notes={historyNotes}
          isLoading={historyLoading}
          isError={historyError}
          onRetry={onHistoryRetry}
          isRetrying={historyRetrying}
        />
      </div>
    </div>
  )
}

function TemplatePicker({
  onSelect,
}: {
  onSelect: (id: ClinicalNoteTemplateId) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          Escolha um template
        </p>
        <p className="text-sm text-muted-foreground">
          O formulário é a fonte da verdade; o documento TipTap é gerado ao
          salvar.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {CLINICAL_NOTE_TEMPLATES.map((template) => (
          <li key={template.id}>
            <button
              type="button"
              className="flex h-full w-full flex-col gap-1 rounded-md border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted/50"
              onClick={() => onSelect(template.id)}
            >
              <span className="text-sm font-medium text-foreground">
                {template.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {template.description}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
