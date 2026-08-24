"use client"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Spinner } from "@/components/ui/spinner"
import { ClinicCalendarSettingsForm } from "@/modules/appointments/components/ClinicCalendarSettingsForm"
import { DEFAULT_CLINIC_CALENDAR_SETTINGS } from "@/modules/clinics/constants/default-calendar-settings"
import { useClinicCalendarSettings } from "@/modules/clinics/hooks/use-clinic-hours"

export function ClinicCalendarSettingsPanel() {
  const {
    data: settings,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useClinicCalendarSettings()

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Carregando a agenda…
      </div>
    )
  }

  if (isError) {
    return (
      <QueryErrorState
        description="Não foi possível abrir estas configurações."
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  return (
    <ClinicCalendarSettingsForm
      initialSettings={settings ?? DEFAULT_CLINIC_CALENDAR_SETTINGS}
    />
  )
}
