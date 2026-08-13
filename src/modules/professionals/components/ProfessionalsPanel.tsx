"use client"

import { PlusIcon } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import { PageHeader } from "@/components/layout/PageHeader"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { OwnerClinicalProfileCallout } from "@/modules/professionals/components/OwnerClinicalProfileCallout"
import { ProfessionalFormDialog } from "@/modules/professionals/components/ProfessionalFormDialog"
import { ProfessionalHoursDialog } from "@/modules/professionals/components/ProfessionalHoursDialog"
import { ProfessionalsTable } from "@/modules/professionals/components/ProfessionalsTable"
import { formatProfessionalDisplayName } from "@/modules/professionals/constants/professionals"
import type { ProfessionalListItem } from "@/modules/professionals/types/professional"
import type { PageAction } from "@/types/page-action"

export function ProfessionalsPanel() {
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] =
    useState<ProfessionalListItem | null>(null)
  const [hoursProfessional, setHoursProfessional] =
    useState<ProfessionalListItem | null>(null)

  function handleEditProfessional(professional: ProfessionalListItem) {
    setEditingProfessional(professional)
    setDialogOpen(true)
  }

  function handleEditHours(professional: ProfessionalListItem) {
    setHoursProfessional(professional)
    setHoursDialogOpen(true)
  }

  const pageActions = useMemo<PageAction[]>(
    () => [
      {
        id: "new-professional",
        label: "Novo profissional",
        icon: PlusIcon,
        onClick: () => {
          setEditingProfessional(null)
          setDialogOpen(true)
        },
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profissionais"
        description="Cadastro e convites de profissionais de saúde da clínica."
        actions={pageActions}
      />

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
        onEditHours={handleEditHours}
      />

      <ProfessionalFormDialog
        professional={editingProfessional}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingProfessional(null)
        }}
      />

      <ProfessionalHoursDialog
        professionalId={hoursProfessional?.id ?? null}
        professionalName={
          hoursProfessional
            ? formatProfessionalDisplayName({
                fullName: hoursProfessional.fullName,
                treatmentPronoun: hoursProfessional.treatmentPronoun,
              })
            : null
        }
        open={hoursDialogOpen}
        onOpenChange={(open) => {
          setHoursDialogOpen(open)
          if (!open) setHoursProfessional(null)
        }}
        accessMode="manage"
      />
    </div>
  )
}
