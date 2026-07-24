"use client"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { InviteMemberDialog } from "@/modules/users/components/InviteMemberDialog"
import { MembersTable } from "@/modules/users/components/MembersTable"

export function TeamPanel() {
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Equipe
          </h1>
          <p className="text-sm text-muted-foreground">
            Pessoas com acesso à clínica ativa.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <DataTableSearch
        value={q ?? ""}
        onValueChange={setQ}
        placeholder="Buscar por nome ou e-mail"
      />

      <MembersTable
        filters={{ q, page, pageSize }}
        onPageChange={setPage}
      />
    </div>
  )
}
