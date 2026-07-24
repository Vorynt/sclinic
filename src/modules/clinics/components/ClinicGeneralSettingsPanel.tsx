"use client"

import { Spinner } from "@/components/ui/spinner"
import { ClinicGeneralForm } from "@/modules/clinics/components/ClinicGeneralForm"
import { useActiveClinicForSettings } from "@/modules/clinics/hooks/use-clinic-hours"

export function ClinicGeneralSettingsPanel() {
  const { data: clinic, isPending, isError } = useActiveClinicForSettings()

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Carregando dados da clínica…
      </div>
    )
  }

  if (isError || !clinic) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os dados da clínica.
      </p>
    )
  }

  return <ClinicGeneralForm clinic={clinic} />
}
