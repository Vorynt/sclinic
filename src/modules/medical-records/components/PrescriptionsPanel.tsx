"use client"

import { FileTextIcon, LockIcon, PlusIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { ListCardSkeleton } from "@/components/data-table/ListCardSkeleton"
import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { routes } from "@/config/routes"
import { AttendanceDeclarationFormDialog } from "@/modules/medical-records/components/AttendanceDeclarationFormDialog"
import { ExamRequestFormDialog } from "@/modules/medical-records/components/ExamRequestFormDialog"
import { MedicalCertificateFormDialog } from "@/modules/medical-records/components/MedicalCertificateFormDialog"
import {
  NewClinicalDocumentDialog,
  type NewClinicalDocumentKind,
} from "@/modules/medical-records/components/NewClinicalDocumentDialog"
import { PrescriptionFormDialog } from "@/modules/medical-records/components/PrescriptionFormDialog"
import { PrescriptionListItem } from "@/modules/medical-records/components/PrescriptionListItem"
import {
  useCreateAttendanceDeclarationMutation,
  useCreateExamRequestMutation,
  useCreateMedicalCertificateMutation,
  useCreatePrescriptionMutation,
  useDeletePrescriptionDraftMutation,
  useSaveAndIssueAttendanceDeclarationMutation,
  useSaveAndIssueExamRequestMutation,
  useSaveAndIssueMedicalCertificateMutation,
  useSaveAndIssuePrescriptionMutation,
  useUpdateAttendanceDeclarationDraftMutation,
  useUpdateExamRequestDraftMutation,
  useUpdateMedicalCertificateDraftMutation,
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
      <div
        role="status"
        aria-label="Carregando documentos"
        className="flex flex-col gap-4"
      >
        <div className="flex justify-end">
          <Skeleton className="h-8 w-36" />
        </div>
        <ListCardSkeleton rows={4} />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar os documentos."
        onRetry={() => {
          void query.refetch()
        }}
        isRetrying={query.isFetching}
      />
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

type DialogMode = NewClinicalDocumentKind | null

function PrescriptionsPanelContent({
  appointmentId,
  data,
}: PrescriptionsPanelContentProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
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

  const createCertificate = useCreateMedicalCertificateMutation({
    onSuccess: () => {
      toast.success("Rascunho salvo")
      closeDialogs()
    },
    onError: (error) => toast.error(error.message),
  })

  const updateCertificate = useUpdateMedicalCertificateDraftMutation({
    onSuccess: () => {
      toast.success("Rascunho atualizado")
      closeDialogs()
    },
    onError: (error) => toast.error(error.message),
  })

  const saveAndIssueCertificate = useSaveAndIssueMedicalCertificateMutation({
    onSuccess: (prescription) => {
      toast.success("Atestado emitido")
      closeDialogs()
      window.open(
        routes.prescriptionPrint(prescription.id),
        "_blank",
        "noopener,noreferrer",
      )
    },
    onError: (error) => toast.error(error.message),
  })

  const createExamRequest = useCreateExamRequestMutation({
    onSuccess: () => {
      toast.success("Rascunho salvo")
      closeDialogs()
    },
    onError: (error) => toast.error(error.message),
  })

  const updateExamRequest = useUpdateExamRequestDraftMutation({
    onSuccess: () => {
      toast.success("Rascunho atualizado")
      closeDialogs()
    },
    onError: (error) => toast.error(error.message),
  })

  const saveAndIssueExamRequest = useSaveAndIssueExamRequestMutation({
    onSuccess: (prescription) => {
      toast.success("Solicitação emitida")
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

  function openCreatePicker() {
    setPickerOpen(true)
  }

  function openCreateKind(kind: NewClinicalDocumentKind) {
    setEditing(null)
    setDialogMode(kind)
  }

  function openEdit(prescription: Prescription) {
    setEditing(prescription)
    if (prescription.kind === "attendance_declaration") {
      setDialogMode("attendance_declaration")
      return
    }
    if (prescription.kind === "medical_certificate") {
      setDialogMode("medical_certificate")
      return
    }
    if (prescription.kind === "exam_request") {
      setDialogMode("exam_request")
      return
    }
    setDialogMode("prescription")
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

  function handleSaveCertificateDraft(input: {
    daysOff: number
    cid: string | null
    notes: string | null
  }) {
    if (editing) {
      updateCertificate.mutate({ id: editing.id, ...input })
      return
    }
    createCertificate.mutate({ appointmentId, ...input })
  }

  function handleIssueCertificate(input: {
    daysOff: number
    cid: string | null
    notes: string | null
  }) {
    saveAndIssueCertificate.mutate({
      appointmentId,
      id: editing?.id,
      ...input,
    })
  }

  function handleSaveExamRequestDraft(input: {
    examsText: string
    notes: string | null
  }) {
    if (editing) {
      updateExamRequest.mutate({ id: editing.id, ...input })
      return
    }
    createExamRequest.mutate({ appointmentId, ...input })
  }

  function handleIssueExamRequest(input: {
    examsText: string
    notes: string | null
  }) {
    saveAndIssueExamRequest.mutate({
      appointmentId,
      id: editing?.id,
      ...input,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {editable && data.items.length > 0 ? (
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={openCreatePicker}>
            <PlusIcon />
            Novo documento
          </Button>
        </div>
      ) : null}

      {!editable ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LockIcon className="size-4 shrink-0" />
          Edição disponível apenas com o atendimento em andamento.
        </p>
      ) : null}

      {data.items.length === 0 ? (
        <Empty className="min-h-64 border border-dashed py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon weight="duotone" />
            </EmptyMedia>
            <EmptyTitle>Nenhum documento neste atendimento</EmptyTitle>
            <EmptyDescription>
              {editable
                ? "Emita receita, atestado, declaração ou pedido de exame."
                : "Não há documentos emitidos para esta consulta."}
            </EmptyDescription>
          </EmptyHeader>
          {editable ? (
            <EmptyContent>
              <Button type="button" size="sm" onClick={openCreatePicker}>
                <PlusIcon />
                Novo documento
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
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

      <NewClinicalDocumentDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={openCreateKind}
      />

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

      <MedicalCertificateFormDialog
        open={dialogMode === "medical_certificate"}
        onOpenChange={(open) => {
          if (!open) closeDialogs()
        }}
        prescription={
          editing?.kind === "medical_certificate" ? editing : null
        }
        isSaving={createCertificate.isPending || updateCertificate.isPending}
        isIssuing={saveAndIssueCertificate.isPending}
        onSaveDraft={handleSaveCertificateDraft}
        onIssue={handleIssueCertificate}
      />

      <ExamRequestFormDialog
        open={dialogMode === "exam_request"}
        onOpenChange={(open) => {
          if (!open) closeDialogs()
        }}
        prescription={editing?.kind === "exam_request" ? editing : null}
        isSaving={createExamRequest.isPending || updateExamRequest.isPending}
        isIssuing={saveAndIssueExamRequest.isPending}
        onSaveDraft={handleSaveExamRequestDraft}
        onIssue={handleIssueExamRequest}
      />
    </div>
  )
}
