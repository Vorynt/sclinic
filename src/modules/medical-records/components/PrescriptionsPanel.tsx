"use client"

import { LockIcon, PlusIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { AttendanceDeclarationFormDialog } from "@/modules/medical-records/components/AttendanceDeclarationFormDialog"
import { PrescriptionFormDialog } from "@/modules/medical-records/components/PrescriptionFormDialog"
import { PrescriptionListItem } from "@/modules/medical-records/components/PrescriptionListItem"
import {
  useCreateAttendanceDeclarationMutation,
  useCreatePrescriptionMutation,
  useDeletePrescriptionDraftMutation,
  useSaveAndIssueAttendanceDeclarationMutation,
  useSaveAndIssuePrescriptionMutation,
  useUpdateAttendanceDeclarationDraftMutation,
  useUpdatePrescriptionDraftMutation,
} from "@/modules/medical-records/hooks/use-prescription-mutations"
import { useAppointmentPrescriptionsQuery } from "@/modules/medical-records/hooks/use-prescriptions"
import type {
  Prescription,
  PrescriptionsForAppointment,
} from "@/modules/medical-records/types/prescription"

type PrescriptionsPanelProps = {
  appointmentId: string
}

export function PrescriptionsPanel({ appointmentId }: PrescriptionsPanelProps) {
  const query = useAppointmentPrescriptionsQuery(appointmentId)

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os documentos.
      </p>
    )
  }

  return (
    <PrescriptionsPanelContent
      key={appointmentId}
      appointmentId={appointmentId}
      data={query.data}
    />
  )
}

type PrescriptionsPanelContentProps = {
  appointmentId: string
  data: PrescriptionsForAppointment
}

type DialogMode = "prescription" | "attendance_declaration" | null

function PrescriptionsPanelContent({
  appointmentId,
  data,
}: PrescriptionsPanelContentProps) {
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editing, setEditing] = useState<Prescription | null>(null)

  const create = useCreatePrescriptionMutation({
    onSuccess: () => {
      toast.success("Rascunho salvo")
      closeDialogs()
    },
    onError: (error) => toast.error(error.message),
  })

  const updateDraft = useUpdatePrescriptionDraftMutation({
    onSuccess: () => {
      toast.success("Rascunho atualizado")
      closeDialogs()
    },
    onError: (error) => toast.error(error.message),
  })

  const saveAndIssue = useSaveAndIssuePrescriptionMutation({
    onSuccess: (prescription) => {
      toast.success("Receita emitida")
      closeDialogs()
      window.open(
        routes.prescriptionPrint(prescription.id),
        "_blank",
        "noopener,noreferrer",
      )
    },
    onError: (error) => toast.error(error.message),
  })

  const createDeclaration = useCreateAttendanceDeclarationMutation({
    onSuccess: () => {
      toast.success("Rascunho salvo")
      closeDialogs()
    },
    onError: (error) => toast.error(error.message),
  })

  const updateDeclaration = useUpdateAttendanceDeclarationDraftMutation({
    onSuccess: () => {
      toast.success("Rascunho atualizado")
      closeDialogs()
    },
    onError: (error) => toast.error(error.message),
  })

  const saveAndIssueDeclaration = useSaveAndIssueAttendanceDeclarationMutation({
    onSuccess: (prescription) => {
      toast.success("Declaração emitida")
      closeDialogs()
      window.open(
        routes.prescriptionPrint(prescription.id),
        "_blank",
        "noopener,noreferrer",
      )
    },
    onError: (error) => toast.error(error.message),
  })

  const removeDraft = useDeletePrescriptionDraftMutation({
    onSuccess: () => toast.success("Rascunho excluído"),
    onError: (error) => toast.error(error.message),
  })

  const editable = data.editable

  function closeDialogs() {
    setDialogMode(null)
    setEditing(null)
  }

  function openCreatePrescription() {
    setEditing(null)
    setDialogMode("prescription")
  }

  function openCreateDeclaration() {
    setEditing(null)
    setDialogMode("attendance_declaration")
  }

  function openEdit(prescription: Prescription) {
    setEditing(prescription)
    setDialogMode(
      prescription.kind === "attendance_declaration"
        ? "attendance_declaration"
        : "prescription",
    )
  }

  function handleSavePrescriptionDraft(input: {
    body: string
    plainText: string
    layoutId: string | null
  }) {
    if (editing) {
      updateDraft.mutate({ id: editing.id, ...input })
      return
    }
    create.mutate({ appointmentId, ...input })
  }

  function handleIssuePrescription(input: {
    body: string
    plainText: string
    layoutId: string | null
  }) {
    saveAndIssue.mutate({
      appointmentId,
      id: editing?.id,
      ...input,
    })
  }

  function handleSaveDeclarationDraft(input: { notes: string | null }) {
    if (editing) {
      updateDeclaration.mutate({ id: editing.id, notes: input.notes })
      return
    }
    createDeclaration.mutate({ appointmentId, notes: input.notes })
  }

  function handleIssueDeclaration(input: { notes: string | null }) {
    saveAndIssueDeclaration.mutate({
      appointmentId,
      id: editing?.id,
      notes: input.notes,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Documentos
          </h2>
          <p className="text-sm text-muted-foreground">
            Receitas, declarações e outros documentos do atendimento.
          </p>
        </div>
        {editable ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm">
                <PlusIcon />
                Novo documento
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={openCreatePrescription}>
                Receita
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={openCreateDeclaration}>
                Declaração de comparecimento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {!editable ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LockIcon className="size-4 shrink-0" />
          Edição disponível apenas com o atendimento em andamento.
        </p>
      ) : null}

      {data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum documento neste atendimento.
          </p>
          {editable ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={openCreatePrescription}
              >
                <PlusIcon />
                Nova receita
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={openCreateDeclaration}
              >
                <PlusIcon />
                Declaração de comparecimento
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.items.map((item) => (
            <PrescriptionListItem
              key={item.id}
              prescription={item}
              canEditDraft={editable}
              isDeleting={removeDraft.isPending}
              onEditDraft={openEdit}
              onDeleteDraft={(prescription) =>
                removeDraft.mutate({ id: prescription.id })
              }
            />
          ))}
        </ul>
      )}

      <PrescriptionFormDialog
        open={dialogMode === "prescription"}
        onOpenChange={(open) => {
          if (!open) closeDialogs()
        }}
        preview={data.preview}
        templates={data.templates}
        prescription={
          editing?.kind === "prescription" || !editing ? editing : null
        }
        isSaving={create.isPending || updateDraft.isPending}
        isIssuing={saveAndIssue.isPending}
        onSaveDraft={handleSavePrescriptionDraft}
        onIssue={handleIssuePrescription}
      />

      <AttendanceDeclarationFormDialog
        open={dialogMode === "attendance_declaration"}
        onOpenChange={(open) => {
          if (!open) closeDialogs()
        }}
        prescription={
          editing?.kind === "attendance_declaration" ? editing : null
        }
        isSaving={createDeclaration.isPending || updateDeclaration.isPending}
        isIssuing={saveAndIssueDeclaration.isPending}
        onSaveDraft={handleSaveDeclarationDraft}
        onIssue={handleIssueDeclaration}
      />
    </div>
  )
}
