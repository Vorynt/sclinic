"use client"

import { LockIcon, PlusIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { PrescriptionFormDialog } from "@/modules/medical-records/components/PrescriptionFormDialog"
import { PrescriptionListItem } from "@/modules/medical-records/components/PrescriptionListItem"
import {
  useCreatePrescriptionMutation,
  useDeletePrescriptionDraftMutation,
  useSaveAndIssuePrescriptionMutation,
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
        Não foi possível carregar as receitas.
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

function PrescriptionsPanelContent({
  appointmentId,
  data,
}: PrescriptionsPanelContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Prescription | null>(null)

  const create = useCreatePrescriptionMutation({
    onSuccess: () => {
      toast.success("Rascunho salvo")
      setDialogOpen(false)
      setEditing(null)
    },
    onError: (error) => toast.error(error.message),
  })

  const updateDraft = useUpdatePrescriptionDraftMutation({
    onSuccess: () => {
      toast.success("Rascunho atualizado")
      setDialogOpen(false)
      setEditing(null)
    },
    onError: (error) => toast.error(error.message),
  })

  const saveAndIssue = useSaveAndIssuePrescriptionMutation({
    onSuccess: (prescription) => {
      toast.success("Receita emitida")
      setDialogOpen(false)
      setEditing(null)
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

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function handleSaveDraft(input: {
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

  function handleIssue(input: {
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Receitas
          </h2>
          <p className="text-sm text-muted-foreground">
            Emita receitas com preview antes de imprimir.
          </p>
        </div>
        {editable ? (
          <Button type="button" size="sm" onClick={openCreate}>
            <PlusIcon />
            Nova receita
          </Button>
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
            Nenhuma receita neste atendimento.
          </p>
          {editable ? (
            <Button
              type="button"
              className="mt-4"
              variant="outline"
              onClick={openCreate}
            >
              <PlusIcon />
              Nova receita
            </Button>
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
              onEditDraft={(prescription) => {
                setEditing(prescription)
                setDialogOpen(true)
              }}
              onDeleteDraft={(prescription) =>
                removeDraft.mutate({ id: prescription.id })
              }
            />
          ))}
        </ul>
      )}

      <PrescriptionFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditing(null)
        }}
        preview={data.preview}
        templates={data.templates}
        prescription={editing}
        isSaving={create.isPending || updateDraft.isPending}
        isIssuing={saveAndIssue.isPending}
        onSaveDraft={handleSaveDraft}
        onIssue={handleIssue}
      />
    </div>
  )
}
