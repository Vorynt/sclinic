"use client"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import { PageHeader } from "@/components/layout/PageHeader"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { InviteMemberDialog } from "@/modules/users/components/InviteMemberDialog"
import { MembersTable } from "@/modules/users/components/MembersTable"

export function TeamPanel() {
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Equipe"
        description="Pessoas com acesso à clínica ativa."
        actions={<InviteMemberDialog />}
      />

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
