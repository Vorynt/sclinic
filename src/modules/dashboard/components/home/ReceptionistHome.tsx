"use client"

import { CalendarPlusIcon, UserPlusIcon } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Permission } from "@/config/permissions"
import { useRegisterPageActions } from "@/hooks/use-register-page-actions"
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import { WaitlistPanel } from "@/modules/appointments/components/WaitlistPanel"
import { ReceptionOpsBoard } from "@/modules/dashboard/components/home/ReceptionOpsBoard"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog"
import { useAuth } from "@/providers/AuthProvider"
import type { PageAction } from "@/types/page-action"

export function ReceptionistHome() {
  const { can } = useAuth()
  const canWritePatients = can(Permission.PATIENTS_WRITE)
  const canCreateAppointments = can(Permission.APPOINTMENTS_CREATE)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [patientDialogOpen, setPatientDialogOpen] = useState(false)

  const pageActions = useMemo<PageAction[]>(() => {
    const actions: PageAction[] = []
    if (canWritePatients) {
      actions.push({
        id: "new-patient",
        label: "Novo paciente",
        icon: UserPlusIcon,
        onClick: () => setPatientDialogOpen(true),
        priority: "secondary",
      })
    }
    if (canCreateAppointments) {
      actions.push({
        id: "new-appointment",
        label: "Novo agendamento",
        icon: CalendarPlusIcon,
        onClick: () => setAppointmentDialogOpen(true),
        priority: "primary",
      })
    }
    return actions
  }, [canWritePatients, canCreateAppointments])

  useRegisterPageActions(pageActions)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <HomeGreeting subtitle="Receba pacientes, acompanhe o dia e registre pagamentos no balcão." />
        </div>
        <div className="hidden shrink-0 flex-wrap items-center gap-2 md:flex">
          {canWritePatients ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setPatientDialogOpen(true)}
            >
              <UserPlusIcon data-icon="inline-start" />
              Novo paciente
            </Button>
          ) : null}
          {canCreateAppointments ? (
            <Button
              type="button"
              onClick={() => setAppointmentDialogOpen(true)}
            >
              <CalendarPlusIcon data-icon="inline-start" />
              Novo agendamento
            </Button>
          ) : null}
        </div>
      </div>

      <ReceptionOpsBoard />
      <WaitlistPanel />

      {canCreateAppointments ? (
        <AppointmentFormDialog
          open={appointmentDialogOpen}
          onOpenChange={setAppointmentDialogOpen}
        />
      ) : null}
      {canWritePatients ? (
        <PatientFormDialog
          open={patientDialogOpen}
          onOpenChange={setPatientDialogOpen}
          variant="quick"
        />
      ) : null}
    </div>
  )
}
