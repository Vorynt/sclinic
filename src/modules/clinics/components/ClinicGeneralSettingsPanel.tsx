"use client"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Spinner } from "@/components/ui/spinner"
import { ClinicGeneralForm } from "@/modules/clinics/components/ClinicGeneralForm"
import { useActiveClinicForSettings } from "@/modules/clinics/hooks/use-clinic-hours"

export function ClinicGeneralSettingsPanel() {
  const {
    data: clinic,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useActiveClinicForSettings()

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
      <QueryErrorState
        description="Não foi possível carregar os dados da clínica."
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  return <ClinicGeneralForm clinic={clinic} />
}
