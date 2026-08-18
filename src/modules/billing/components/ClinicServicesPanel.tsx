"use client"

import { PlusIcon } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import { PageHeader } from "@/components/layout/PageHeader"
import { Permission } from "@/config/permissions"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { ClinicServiceFormDialog } from "@/modules/billing/components/ClinicServiceFormDialog"
import { ClinicServicesTable } from "@/modules/billing/components/ClinicServicesTable"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import { useAuth } from "@/providers/AuthProvider"
import type { PageAction } from "@/types/page-action"

export function ClinicServicesPanel() {
  const { can } = useAuth()
  const canManage = can(Permission.FINANCIAL_MANAGE)
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ClinicService | null>(
    null,
  )

  function handleEditService(service: ClinicService) {
    setEditingService(service)
    setDialogOpen(true)
  }

  const pageActions = useMemo<PageAction[]>(
    () =>
      canManage
        ? [
            {
              id: "new-service",
              label: "Novo serviço",
              icon: PlusIcon,
              onClick: () => {
                setEditingService(null)
                setDialogOpen(true)
              },
            },
          ]
        : [],
    [canManage],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Serviços"
        description="Catálogo de serviços e preços usados na agenda e no faturamento."
        actions={pageActions}
      />

      <DataTableSearch
        value={q ?? ""}
        onValueChange={setQ}
        placeholder="Buscar por nome"
      />

      <ClinicServicesTable
        filters={{ q, page, pageSize }}
        onPageChange={setPage}
        onEdit={handleEditService}
      />

      {canManage ? (
        <ClinicServiceFormDialog
          service={editingService}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setEditingService(null)
          }}
        />
      ) : null}
    </div>
  )
}
