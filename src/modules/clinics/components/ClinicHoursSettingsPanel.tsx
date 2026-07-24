"use client"

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
  const { data: hours, isPending, isError } = useClinicHours()

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
      <p className="text-sm text-destructive">
        Não foi possível carregar os horários da clínica.
      </p>
    )
  }

  const initialDays = isUnconfiguredWeek(hours)
    ? buildOnboardingHoursDraft()
    : hours

  return <ClinicHoursForm initialDays={initialDays} />
}
