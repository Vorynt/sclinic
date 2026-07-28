import type { Metadata } from "next"

import { AccountSubscriptionPanel } from "@/modules/billing/components/AccountSubscriptionPanel"
import { AccountPageHeader } from "@/modules/users/components/AccountPageHeader"

export const metadata: Metadata = {
  title: "Assinatura · Minha conta · sclinic",
}

export default function AccountSubscriptionPage() {
  return (
    <div className="flex flex-col gap-6">
      <AccountPageHeader
        title="Assinatura"
        description="Plano, status de pagamento e gerenciamento da assinatura."
      />
      <AccountSubscriptionPanel />
    </div>
  )
}
