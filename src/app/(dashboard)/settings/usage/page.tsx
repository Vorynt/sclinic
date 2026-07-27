import type { Metadata } from "next"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { ClinicPlanUsagePanel } from "@/modules/billing/components/ClinicPlanUsagePanel"
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader"
import { OwnerProvider } from "@/providers/OwnerProvider"

export const metadata: Metadata = {
  title: "Uso do plano · Configurações · sclinic",
}

export default function SettingsUsagePage() {
  return (
    <OwnerProvider
      fallback={
        <ForbiddenBlock
          title="Acesso restrito"
          description="Apenas o proprietário da clínica pode ver o uso dos recursos do plano."
        />
      }
    >
      <div className="flex flex-col gap-6">
        <SettingsPageHeader
          title="Uso do plano"
          description="Consumo desta clínica em relação aos limites da sua assinatura."
        />
        <ClinicPlanUsagePanel />
      </div>
    </OwnerProvider>
  )
}
