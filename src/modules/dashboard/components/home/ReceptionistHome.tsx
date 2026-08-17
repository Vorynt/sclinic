"use client"

import { CalendarPlusIcon, UserPlusIcon } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useRegisterPageActions } from "@/hooks/use-register-page-actions"
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import { WaitlistPanel } from "@/modules/appointments/components/WaitlistPanel"
import { ReceptionOpsBoard } from "@/modules/dashboard/components/home/ReceptionOpsBoard"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog"
import type { PageAction } from "@/types/page-action"

export function ReceptionistHome() {
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [patientDialogOpen, setPatientDialogOpen] = useState(false)

  const pageActions = useMemo<PageAction[]>(
    () => [
      {
        id: "new-patient",
        label: "Novo paciente",
        icon: UserPlusIcon,
        onClick: () => setPatientDialogOpen(true),
        priority: "secondary",
      },
      {
        id: "new-appointment",
        label: "Novo agendamento",
        icon: CalendarPlusIcon,
        onClick: () => setAppointmentDialogOpen(true),
        priority: "primary",
      },
    ],
    [],
  )

  useRegisterPageActions(pageActions)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <HomeGreeting subtitle="Receba pacientes, acompanhe o dia e registre pagamentos no balcão." />
        </div>
        <div className="hidden shrink-0 flex-wrap items-center gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPatientDialogOpen(true)}
          >
            <UserPlusIcon data-icon="inline-start" />
            Novo paciente
          </Button>
          <Button
            type="button"
            onClick={() => setAppointmentDialogOpen(true)}
          >
            <CalendarPlusIcon data-icon="inline-start" />
            Novo agendamento
          </Button>
        </div>
      </div>

      <ReceptionOpsBoard />
      <WaitlistPanel />

      <AppointmentFormDialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
      />
      <PatientFormDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        variant="quick"
      />
    </div>
  )
}
