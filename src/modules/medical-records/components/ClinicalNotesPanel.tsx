"use client";

import { NotePencilIcon } from "@phosphor-icons/react";
import type { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { toast } from "sonner";

import { QueryErrorState } from "@/components/status/QueryErrorState";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Permission } from "@/config/permissions";
import { cn } from "@/lib/utils";
import {
  ClinicalNoteEditor,
  EMPTY_DOC,
} from "@/modules/medical-records/components/ClinicalNoteEditor";
import { useClinicalNoteAutosave } from "@/modules/medical-records/hooks/use-clinical-note-autosave";
import { useClinicalNoteForAppointmentQuery } from "@/modules/medical-records/hooks/use-clinical-notes";
import type { ClinicalNoteForAppointment } from "@/modules/medical-records/types/clinical-note";
import { getClinicalNoteSaveStatusLabel } from "@/modules/medical-records/utils/clinical-note-autosave";
import { useAuth } from "@/providers/AuthProvider";

type ClinicalNotesPanelProps = {
  appointmentId: string;
};

export function ClinicalNotesPanel({ appointmentId }: ClinicalNotesPanelProps) {
  const noteQuery = useClinicalNoteForAppointmentQuery(appointmentId);

  if (noteQuery.isLoading) {
    return (
      <div
        role="status"
        aria-label="Carregando anotações"
        className="flex flex-col gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64 max-w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (noteQuery.isError || !noteQuery.data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar as anotações."
        onRetry={() => {
          void noteQuery.refetch();
        }}
        isRetrying={noteQuery.isFetching}
      />
    );
  }

  return (
    <ClinicalNotesPanelContent
      key={appointmentId}
      appointmentId={appointmentId}
      data={noteQuery.data}
    />
  );
}

type ClinicalNotesPanelContentProps = {
  appointmentId: string;
  data: ClinicalNoteForAppointment;
};

function ClinicalNotesPanelContent({
  appointmentId,
  data,
}: ClinicalNotesPanelContentProps) {
  const { can } = useAuth();
  const editable = data.editable && can(Permission.RECORDS_WRITE);
  const note = data.note;
  const [content, setContent] = useState<JSONContent>(
    () => (note?.content as JSONContent | undefined) ?? EMPTY_DOC,
  );
  const [plainText, setPlainText] = useState(() => note?.plainText ?? "");
  const [editorInitialContent] = useState(content);

  const autosave = useClinicalNoteAutosave({
    appointmentId,
    content,
    plainText,
    enabled: editable,
    initialContent: editorInitialContent,
    initialPlainText: note?.plainText ?? "",
    initialSavedAt: note?.updatedAt ?? null,
    onManualSaveSuccess: () => {
      toast.success("Anotação salva");
    },
    onError: (error) => toast.error(error.message),
  });

  const hasNote = Boolean(note?.plainText.trim());
  const showEmptyReadonly = !editable && !hasNote;
  const saveStatusLabel = getClinicalNoteSaveStatusLabel(
    autosave.status,
    autosave.lastSavedAt,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Anotações
          </h2>
          <p className="text-sm text-muted-foreground">
            {editable
              ? "Escreva livremente ou insira um modelo clínico na barra de ferramentas. A anotação é salva automaticamente."
              : "Somente leitura — você não pode editar esta anotação."}
          </p>
        </div>
      </div>

      {showEmptyReadonly ? (
        <Empty className="min-h-80 border border-dashed py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NotePencilIcon weight="duotone" />
            </EmptyMedia>
            <EmptyTitle>Nenhuma anotação neste atendimento</EmptyTitle>
            <EmptyDescription>
              Não há evolução clínica registrada para esta consulta.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <ClinicalNoteEditor
            initialContent={editorInitialContent}
            editable={editable}
            onChange={(nextContent, nextPlainText) => {
              setContent(nextContent);
              setPlainText(nextPlainText);
            }}
          />
          {editable ? (
            <div className="flex items-center justify-between gap-3">
              <p
                className={cn(
                  "text-xs text-muted-foreground",
                  autosave.isPending && "shimmer",
                )}
                aria-live="polite">
                {saveStatusLabel ?? "\u00a0"}
              </p>
              <Button
                type="button"
                disabled={autosave.isPending || !autosave.canSave}
                onClick={() => autosave.saveNow()}>
                {autosave.isManualSaving ? <Spinner /> : null}
                Salvar anotação
              </Button>
            </div>
          ) : saveStatusLabel ? (
            <p className="text-xs text-muted-foreground">{saveStatusLabel}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
