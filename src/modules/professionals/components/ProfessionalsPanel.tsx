"use client"

import { useState } from "react"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import { Button } from "@/components/ui/button"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { OwnerClinicalProfileCallout } from "@/modules/professionals/components/OwnerClinicalProfileCallout"
import { ProfessionalFormDialog } from "@/modules/professionals/components/ProfessionalFormDialog"
import { ProfessionalsTable } from "@/modules/professionals/components/ProfessionalsTable"
import type { ProfessionalListItem } from "@/modules/professionals/types/professional"

export function ProfessionalsPanel() {
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] =
    useState<ProfessionalListItem | null>(null)

  function handleNewProfessional() {
    setEditingProfessional(null)
    setDialogOpen(true)
  }

  function handleEditProfessional(professional: ProfessionalListItem) {
    setEditingProfessional(professional)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Profissionais
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastro e convites de médicos e enfermeiros da clínica.
          </p>
        </div>
        <Button type="button" onClick={handleNewProfessional}>
          Novo profissional
        </Button>
      </div>

      <OwnerClinicalProfileCallout />

      <DataTableSearch
        value={q ?? ""}
        onValueChange={setQ}
        placeholder="Buscar por nome, especialidade ou e-mail"
      />

      <ProfessionalsTable
        filters={{ q, page, pageSize }}
        onPageChange={setPage}
        onEdit={handleEditProfessional}
      />

      <ProfessionalFormDialog
        professional={editingProfessional}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingProfessional(null)
        }}
      />
    </div>
  )
}
