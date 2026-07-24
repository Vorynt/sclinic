import type { Metadata } from "next"

import { ClinicGeneralSettingsPanel } from "@/modules/clinics/components/ClinicGeneralSettingsPanel"
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader"

export const metadata: Metadata = {
  title: "Geral · Configurações · sclinic",
}

export default function SettingsGeneralPage() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsPageHeader
        title="Geral"
        description="Dados básicos, contato, endereço e fuso horário da clínica."
      />
      <ClinicGeneralSettingsPanel />
    </div>
  )
}
