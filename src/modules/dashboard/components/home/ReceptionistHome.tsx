"use client"

import {
  CalendarBlankIcon,
  CalendarPlusIcon,
  UserPlusIcon,
} from "@phosphor-icons/react"
import { endOfDay, format, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useMemo, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import { useAppointmentsQuery } from "@/modules/appointments/hooks/use-appointments"
import { useActiveChargesByAppointmentsQuery } from "@/modules/billing/hooks/use-charges"
import type { Charge } from "@/modules/billing/types/charge"
import { HomeGreeting } from "@/modules/dashboard/components/home/shared/HomeGreeting"
import { HomeQuickActions } from "@/modules/dashboard/components/home/shared/HomeQuickActions"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"
import { HomeStatCards } from "@/modules/dashboard/components/home/shared/HomeStatCards"
import { ReceptionOpsBoard } from "@/modules/dashboard/components/home/ReceptionOpsBoard"
import { countReceptionBoardColumns } from "@/modules/dashboard/utils/reception-board"
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog"
import { useAuth } from "@/providers/AuthProvider"

function ReceptionDayKpis() {
  const { canAny, isLoading: authLoading } = useAuth()
  const canSeeCharges = canAny(
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_COLLECT,
    Permission.FINANCIAL_MANAGE,
  )

  const range = useMemo(() => {
    const now = new Date()
    return { from: startOfDay(now), to: endOfDay(now) }
  }, [])

  const appointmentsQuery = useAppointmentsQuery(range)
  const appointments = appointmentsQuery.data ?? []
  const appointmentIds = useMemo(
    () => appointments.map((item) => item.id),
    [appointments],
  )

  const chargesQuery = useActiveChargesByAppointmentsQuery(
    appointmentIds,
    !authLoading && canSeeCharges && appointmentIds.length > 0,
  )

  const chargeByAppointmentId = useMemo(() => {
    const map = new Map<string, Charge>()
    for (const charge of chargesQuery.data ?? []) {
      map.set(charge.appointmentId, charge)
    }
    return map
  }, [chargesQuery.data])

  const counts = useMemo(() => {
    return countReceptionBoardColumns(
      appointments.map((appointment) => ({
        appointment,
        charge: chargeByAppointmentId.get(appointment.id) ?? null,
      })),
    )
  }, [appointments, chargeByAppointmentId])

  const isLoading =
    appointmentsQuery.isLoading ||
    (canSeeCharges && appointmentIds.length > 0 && chargesQuery.isLoading)

  return (
    <HomeSection
      title="Resumo do balcão"
      description={format(range.from, "EEEE, dd 'de' MMMM", { locale: ptBR })}
    >
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <HomeStatCards
          items={[
            {
              label: "Próximos",
              value: String(counts.upcoming),
              hint: "Aguardando chegada",
            },
            {
              label: "Em atendimento",
              value: String(counts.in_progress),
              hint: "Check-in feito",
            },
            {
              label: "Aguardando pagamento",
              value: String(counts.awaiting_payment),
              hint: "Cobrança pendente",
            },
          ]}
        />
      )}
    </HomeSection>
  )
}

export function ReceptionistHome() {
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [patientDialogOpen, setPatientDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      <HomeGreeting subtitle="Receba pacientes, acompanhe o dia e registre pagamentos no balcão." />

      <HomeSection title="Ações rápidas">
        <HomeQuickActions
          actions={[
            {
              label: "Novo agendamento",
              icon: CalendarPlusIcon,
              onClick: () => setAppointmentDialogOpen(true),
            },
            {
              label: "Novo paciente",
              icon: UserPlusIcon,
              onClick: () => setPatientDialogOpen(true),
            },
            {
              label: "Abrir agenda",
              href: routes.appointments,
              icon: CalendarBlankIcon,
            },
          ]}
        />
      </HomeSection>

      <ReceptionDayKpis />
      <ReceptionOpsBoard />

      <AppointmentFormDialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
      />
      <PatientFormDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
      />
    </div>
  )
}
