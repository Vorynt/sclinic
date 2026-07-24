"use client";

import type { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ClinicalNoteEditor,
  EMPTY_DOC,
} from "@/modules/medical-records/components/ClinicalNoteEditor";
import { ClinicalNoteHistoryPanel } from "@/modules/medical-records/components/ClinicalNoteHistoryPanel";
import { useUpsertClinicalNoteMutation } from "@/modules/medical-records/hooks/use-clinical-note-mutations";
import {
  useClinicalNoteForAppointmentQuery,
  usePatientClinicalNotesQuery,
} from "@/modules/medical-records/hooks/use-clinical-notes";
import type {
  ClinicalNote,
  ClinicalNoteForAppointment,
} from "@/modules/medical-records/types/clinical-note";
import { LockIcon } from "@phosphor-icons/react";

type ClinicalNotesPanelProps = {
  appointmentId: string;
};

export function ClinicalNotesPanel({ appointmentId }: ClinicalNotesPanelProps) {
  const noteQuery = useClinicalNoteForAppointmentQuery(appointmentId);
  const historyQuery = usePatientClinicalNotesQuery(
    {
      patientId: noteQuery.data?.patientId ?? "",
      excludeAppointmentId: appointmentId,
    },
    Boolean(noteQuery.data?.patientId),
  );

  if (noteQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (noteQuery.isError || !noteQuery.data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar as anotações.
      </p>
    );
  }

  return (
    <ClinicalNotesPanelContent
      key={appointmentId}
      appointmentId={appointmentId}
      data={noteQuery.data}
      historyNotes={historyQuery.data}
      historyLoading={historyQuery.isLoading}
      historyError={historyQuery.isError}
    />
  );
}

type ClinicalNotesPanelContentProps = {
  appointmentId: string;
  data: ClinicalNoteForAppointment;
  historyNotes: ClinicalNote[] | undefined;
  historyLoading: boolean;
  historyError: boolean;
};

function ClinicalNotesPanelContent({
  appointmentId,
  data,
  historyNotes,
  historyLoading,
  historyError,
}: ClinicalNotesPanelContentProps) {
  const [content, setContent] = useState<JSONContent>(
    () => (data.note?.content as JSONContent | undefined) ?? EMPTY_DOC,
  );
  const [plainText, setPlainText] = useState(() => data.note?.plainText ?? "");

  const upsert = useUpsertClinicalNoteMutation({
    onSuccess: () => toast.success("Anotação salva"),
    onError: (error) => toast.error(error.message),
  });

  const editable = data.editable;
  const hasNote = Boolean(data.note?.plainText.trim());
  const showEmptyReadonly = !editable && !hasNote;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Anotações
          </h2>
          <p className="text-sm text-muted-foreground">
            {editable
              ? "Registre a evolução clínica deste atendimento."
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
        ) : (
          <div className="flex  flex-col gap-4">
            <ClinicalNoteEditor
              key={data.note?.id ?? "new"}
              initialContent={content}
              editable={editable}
              onChange={(nextContent, nextPlainText) => {
                setContent(nextContent);
                setPlainText(nextPlainText);
              }}
            />
            <Button
              type="button"
              disabled={
                upsert.isPending || plainText.trim().length === 0 || !editable
              }
              className="ml-auto"
              onClick={() =>
                upsert.mutate({
                  appointmentId,
                  content: {
                    ...content,
                    type: "doc",
                  },
                  plainText: plainText.trim(),
                })
              }>
              {upsert.isPending ? <Spinner /> : null}
              {!editable ? <LockIcon /> : null}
              Salvar anotação
            </Button>
          </div>
        )}

        <ClinicalNoteHistoryPanel
          notes={historyNotes}
          isLoading={historyLoading}
          isError={historyError}
        />
      </div>
    </div>
  );
}
