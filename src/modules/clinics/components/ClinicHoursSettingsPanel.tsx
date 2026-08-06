"use client"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Spinner } from "@/components/ui/spinner"
import { ClinicHoursForm } from "@/modules/clinics/components/ClinicHoursForm"
import { buildOnboardingHoursDraft } from "@/modules/clinics/constants/default-hours"
import { useClinicHours } from "@/modules/clinics/hooks/use-clinic-hours"

function isUnconfiguredWeek(
  days: { isClosed: boolean; intervals: unknown[] }[],
): boolean {
  return days.every((day) => day.isClosed && day.intervals.length === 0)
}

export function ClinicHoursSettingsPanel() {
  const {
    data: hours,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useClinicHours()

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Carregando horários…
      </div>
    )
  }

  if (isError || !hours) {
    return (
      <QueryErrorState
        description="Não foi possível carregar os horários da clínica."
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  const initialDays = isUnconfiguredWeek(hours)
    ? buildOnboardingHoursDraft()
    : hours

  return <ClinicHoursForm initialDays={initialDays} />
}
