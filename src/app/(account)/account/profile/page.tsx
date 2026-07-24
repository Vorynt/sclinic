import type { Metadata } from "next"

import { AccountPageHeader } from "@/modules/users/components/AccountPageHeader"
import { AccountProfilePanel } from "@/modules/users/components/AccountProfilePanel"

export const metadata: Metadata = {
  title: "Dados pessoais · Minha conta · sclinic",
}

export default function AccountProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <AccountPageHeader
        title="Dados pessoais"
        description="Atualize seu nome e telefone."
      />
      <AccountProfilePanel />
    </div>
  )
}
