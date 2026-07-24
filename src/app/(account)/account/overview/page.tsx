import type { Metadata } from "next"

import { AccountOverviewPanel } from "@/modules/users/components/AccountOverviewPanel"
import { AccountPageHeader } from "@/modules/users/components/AccountPageHeader"

export const metadata: Metadata = {
  title: "Visão geral · Minha conta · sclinic",
}

export default function AccountOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <AccountPageHeader
        title="Visão geral"
        description="Resumo da sua conta e clínicas vinculadas."
      />
      <AccountOverviewPanel />
    </div>
  )
}
