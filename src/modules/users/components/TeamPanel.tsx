"use client"

import { UserPlusIcon } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import { PageHeader } from "@/components/layout/PageHeader"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { InviteMemberDialog } from "@/modules/users/components/InviteMemberDialog"
import { MembersTable } from "@/modules/users/components/MembersTable"
import type { PageAction } from "@/types/page-action"

export function TeamPanel() {
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [inviteOpen, setInviteOpen] = useState(false)

  const pageActions = useMemo<PageAction[]>(
    () => [
      {
        id: "invite-member",
        label: "Convidar colaborador",
        icon: UserPlusIcon,
        onClick: () => setInviteOpen(true),
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Equipe"
        description="Pessoas com acesso à clínica ativa."
        actions={pageActions}
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

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
