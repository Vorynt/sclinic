import type { Metadata } from "next"

import { ClinicServicesPanel } from "@/modules/billing/components/ClinicServicesPanel"
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader"

export const metadata: Metadata = {
  title: "Serviços · Configurações · sclinic",
}

export default function SettingsServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsPageHeader
        title="Serviços"
        description="Catálogo de serviços e preços usados na agenda e no faturamento."
      />
      <ClinicServicesPanel />
    </div>
  )
}
