"use client"

import { InviteMemberDialog } from "@/modules/users/components/InviteMemberDialog"
import { InvitationsTable } from "@/modules/users/components/InvitationsTable"
import { MembersTable } from "@/modules/users/components/MembersTable"

export function TeamPanel() {
  return (
    <div className="flex flex-col gap-10">
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

      <MembersTable />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium text-foreground">
            Convites pendentes
          </h2>
          <p className="text-sm text-muted-foreground">
            Convites enviados aguardando aceite.
          </p>
        </div>
        <InvitationsTable />
      </section>
    </div>
  )
}
