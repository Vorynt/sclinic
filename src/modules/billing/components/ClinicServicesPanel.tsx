"use client"

import { useState } from "react"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import { Button } from "@/components/ui/button"
import { Permission } from "@/config/permissions"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { ClinicServiceFormDialog } from "@/modules/billing/components/ClinicServiceFormDialog"
import { ClinicServicesTable } from "@/modules/billing/components/ClinicServicesTable"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import { useAuth } from "@/providers/AuthProvider"

export function ClinicServicesPanel() {
  const { can } = useAuth()
  const canManage = can(Permission.FINANCIAL_MANAGE)
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ClinicService | null>(
    null,
  )

  function handleNewService() {
    setEditingService(null)
    setDialogOpen(true)
  }

  function handleEditService(service: ClinicService) {
    setEditingService(service)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DataTableSearch
          value={q ?? ""}
          onValueChange={setQ}
          placeholder="Buscar por nome"
          className="sm:max-w-sm"
        />
        {canManage ? (
          <Button type="button" onClick={handleNewService}>
            Novo serviço
          </Button>
        ) : null}
      </div>

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
