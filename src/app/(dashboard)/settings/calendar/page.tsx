import type { Metadata } from "next"

import { ClinicCalendarSettingsPanel } from "@/modules/appointments/components/ClinicCalendarSettingsPanel"
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader"

export const metadata: Metadata = {
  title: "Agenda · Configurações",
}

export default function SettingsCalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsPageHeader
        title="Agenda"
        description="Como a equipe vê a semana, abre a agenda e lê cada consulta."
      />
      <ClinicCalendarSettingsPanel />
    </div>
  )
}
