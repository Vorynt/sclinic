"use client"

import { PlusIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { PrescriptionTemplateCard } from "@/modules/medical-records/components/PrescriptionTemplateCard"
import {
  PrescriptionTemplateEditorDialog,
  type PrescriptionTemplateEditorDraft,
} from "@/modules/medical-records/components/PrescriptionTemplateEditorDialog"
import {
  useCreatePrescriptionLayoutMutation,
  useDeletePrescriptionLayoutMutation,
  useSetDefaultPrescriptionLayoutMutation,
  useUpdatePrescriptionLayoutMutation,
} from "@/modules/medical-records/hooks/use-prescription-mutations"
import { usePrescriptionLayoutsQuery } from "@/modules/medical-records/hooks/use-prescriptions"
import type { PrescriptionLayout } from "@/modules/medical-records/types/prescription"

export function PrescriptionLayoutSettingsPanel() {
  const layoutsQuery = usePrescriptionLayoutsQuery()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PrescriptionLayout | null>(null)
  const [templateToDelete, setTemplateToDelete] =
    useState<PrescriptionLayout | null>(null)

  const create = useCreatePrescriptionLayoutMutation({
    onSuccess: () => {
      toast.success("Modelo criado")
      setDialogOpen(false)
      setEditing(null)
    },
    onError: (error) => toast.error(error.message),
  })

  const update = useUpdatePrescriptionLayoutMutation({
    onSuccess: () => {
      toast.success("Modelo salvo")
      setDialogOpen(false)
      setEditing(null)
    },
    onError: (error) => toast.error(error.message),
  })

  const setDefault = useSetDefaultPrescriptionLayoutMutation({
    onSuccess: () => toast.success("Modelo definido como padrão"),
    onError: (error) => toast.error(error.message),
  })

  const remove = useDeletePrescriptionLayoutMutation({
    onSuccess: () => {
      toast.success("Modelo excluído")
      setTemplateToDelete(null)
    },
    onError: (error) => toast.error(error.message),
  })

  if (layoutsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (layoutsQuery.isError || !layoutsQuery.data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os modelos de receita.
      </p>
    )
  }

  const templates = layoutsQuery.data.templates
  const maxTemplates = layoutsQuery.data.maxTemplates
  const canAdd = templates.length < maxTemplates
  const busy =
    create.isPending ||
    update.isPending ||
    setDefault.isPending ||
    remove.isPending

  function openCreate() {
    if (!canAdd) {
      toast.error(`Limite de ${maxTemplates} modelos atingido.`)
      return
    }
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(template: PrescriptionLayout) {
    setEditing(template)
    setDialogOpen(true)
  }

  function handleSave(draft: PrescriptionTemplateEditorDraft) {
    if (draft.id) {
      update.mutate({
        id: draft.id,
        name: draft.name,
        documentModel: draft.model,
      })
      return
    }
    create.mutate({
      name: draft.name,
      documentModel: draft.model,
      isDefault: templates.length === 0,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Até {maxTemplates} modelos por clínica. Cada card mostra como a folha
          fica; edite em tela cheia.
          {templates.length === 0
            ? " Sem modelos próprios, a emissão usa o padrão do sistema."
            : null}
        </p>
        <Button
          type="button"
          size="sm"
          disabled={!canAdd || busy}
          onClick={openCreate}
        >
          <PlusIcon className="size-3.5" />
          Novo modelo
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum modelo próprio ainda. Use o padrão do sistema ou crie o
            primeiro.
          </p>
          <Button
            type="button"
            className="mt-4"
            disabled={!canAdd || busy}
            onClick={openCreate}
          >
            <PlusIcon className="size-3.5" />
            Criar primeiro modelo
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <PrescriptionTemplateCard
              key={template.id}
              template={template}
              busy={busy}
              onEdit={() => openEdit(template)}
              onSetDefault={() => setDefault.mutate({ id: template.id })}
              onDelete={() => setTemplateToDelete(template)}
            />
          ))}
        </div>
      )}

      <PrescriptionTemplateEditorDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditing(null)
        }}
        template={editing}
        suggestedName={`Modelo ${templates.length + 1}`}
        isSaving={create.isPending || update.isPending}
        isSettingDefault={setDefault.isPending}
        onSave={handleSave}
        onSetDefault={(id) => setDefault.mutate({ id })}
      />

      <AlertDialog
        open={Boolean(templateToDelete)}
        onOpenChange={(open) => {
          if (!open) setTemplateToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir modelo de receita</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{templateToDelete?.name ?? "este modelo"}</strong>? Essa
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (templateToDelete) {
                  remove.mutate({ id: templateToDelete.id })
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
