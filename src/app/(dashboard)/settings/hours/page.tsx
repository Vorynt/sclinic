import type { Metadata } from "next"

import { ClinicHoursSettingsPanel } from "@/modules/clinics/components/ClinicHoursSettingsPanel"
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader"

export const metadata: Metadata = {
  title: "Horários · Configurações · sclinic",
}

export default function SettingsHoursPage() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsPageHeader
        title="Horários"
        description="Defina os dias e intervalos de funcionamento da clínica."
      />
      <ClinicHoursSettingsPanel />
    </div>
  )
}
