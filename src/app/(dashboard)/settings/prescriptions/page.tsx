import type { Metadata } from "next"

import { PrescriptionLayoutSettingsPanel } from "@/modules/medical-records/components/PrescriptionLayoutSettingsPanel"
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader"

export const metadata: Metadata = {
  title: "Receitas · Configurações · sclinic",
}

export default function SettingsPrescriptionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsPageHeader
        title="Receitas"
        description="Até 3 modelos por clínica: monte o cabeçalho e a estrutura da folha para emissão e impressão."
      />
      <PrescriptionLayoutSettingsPanel />
    </div>
  )
}
