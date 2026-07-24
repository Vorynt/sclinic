"use client"

import { useRouter } from "next/navigation"

import { ClinicHoursForm } from "@/modules/clinics/components/ClinicHoursForm"
import { buildOnboardingHoursDraft } from "@/modules/clinics/constants/default-hours"
import { routes } from "@/config/routes"

export function OnboardingHoursPanel() {
  const router = useRouter()

  function goHome() {
    router.replace(routes.home)
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Horário de funcionamento
        </h1>
        <p className="text-sm text-muted-foreground">
          Informe os dias e horários de atendimento. Se a clínica fecha no
          almoço, use Pausa para separar manhã e tarde.
        </p>
      </div>

      <ClinicHoursForm
        initialDays={buildOnboardingHoursDraft()}
        showSkipDefault
        submitLabel="Salvar e continuar"
        onSaved={goHome}
        onSkipped={goHome}
      />
    </div>
  )
}
