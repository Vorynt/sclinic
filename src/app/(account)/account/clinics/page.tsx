import type { Metadata } from "next"

import { AccountClinicsPanel } from "@/modules/users/components/AccountClinicsPanel"
import { AccountPageHeader } from "@/modules/users/components/AccountPageHeader"

export const metadata: Metadata = {
  title: "Clínicas · Minha conta · sclinic",
}

export default function AccountClinicsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AccountPageHeader
        title="Clínicas"
        description="Acesse, saia ou exclua as clínicas vinculadas a esta conta."
      />
      <AccountClinicsPanel />
    </div>
  )
}
