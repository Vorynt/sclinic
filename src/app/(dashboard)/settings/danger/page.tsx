import type { Metadata } from "next"

import { ClinicDangerSettingsPanel } from "@/modules/clinics/components/ClinicDangerSettingsPanel"
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader"

export const metadata: Metadata = {
  title: "Zona de perigo · Configurações · sclinic",
}

export default function SettingsDangerPage() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsPageHeader
        title="Zona de perigo"
        description="Ações irreversíveis relacionadas à clínica."
      />
      <ClinicDangerSettingsPanel />
    </div>
  )
}
