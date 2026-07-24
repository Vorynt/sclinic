"use client"

import { PlusIcon } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { AppointmentDayView } from "@/modules/appointments/components/AppointmentDayView"
import { AppointmentDetailDrawer } from "@/modules/appointments/components/AppointmentDetailDrawer"
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import { AppointmentMonthView } from "@/modules/appointments/components/AppointmentMonthView"
import { AppointmentsCalendarSkeleton } from "@/modules/appointments/components/AppointmentsPageSkeleton"
import { AppointmentsToolbar } from "@/modules/appointments/components/AppointmentsToolbar"
import { AppointmentWeekView } from "@/modules/appointments/components/AppointmentWeekView"
import {
  useAppointmentsQuery,
  useCalendarClinicHoursQuery,
} from "@/modules/appointments/hooks/use-appointments"
import type { Appointment } from "@/modules/appointments/types/appointment"
import {
  type CalendarViewMode,
  getNextAnchor,
  getPeriodLabel,
  getPreviousAnchor,
  getVisibleRange,
} from "@/modules/appointments/utils/calendar-range"

export function AppointmentsPanel() {
  const isMobile = useIsMobile()
  const appliedMobileDefault = useRef(false)

  const [mode, setMode] = useState<CalendarViewMode>("month")
  const [anchor, setAnchor] = useState(() => new Date())
  const [detailAppointment, setDetailAppointment] =
    useState<Appointment | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [formDefaultStartsAt, setFormDefaultStartsAt] = useState<
    Date | undefined
  >(undefined)

  useEffect(() => {
    if (isMobile && !appliedMobileDefault.current) {
      setMode("day")
      appliedMobileDefault.current = true
    }
  }, [isMobile])

  const range = useMemo(() => getVisibleRange(mode, anchor), [mode, anchor])
  const periodLabel = useMemo(() => getPeriodLabel(mode, anchor), [mode, anchor])
  const appointmentsQuery = useAppointmentsQuery(range)
  const calendarHoursQuery = useCalendarClinicHoursQuery()
  const appointments = appointmentsQuery.data ?? []
  const weeklyHours = calendarHoursQuery.data
  const isCalendarLoading =
    appointmentsQuery.isLoading ||
    (mode !== "month" && calendarHoursQuery.isLoading)
  const isCalendarError =
    appointmentsQuery.isError ||
    (mode !== "month" && calendarHoursQuery.isError)

  function handlePrevious() {
    setAnchor((current) => getPreviousAnchor(mode, current))
  }

  function handleNext() {
    setAnchor((current) => getNextAnchor(mode, current))
  }

  function handleToday() {
    setAnchor(new Date())
  }

  function handleSelectDay(date: Date) {
    setAnchor(date)
    setMode("day")
  }

  function handleSelectAppointment(appointment: Appointment) {
    setDetailAppointment(appointment)
  }

  function handleSelectSlot(date: Date) {
    setFormDefaultStartsAt(date)
    setFormDialogOpen(true)
  }

  function handleNewAppointment() {
    setFormDefaultStartsAt(undefined)
    setFormDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Agendamentos
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulte e organize a agenda de consultas da clínica.
          </p>
        </div>
        <Button type="button" onClick={handleNewAppointment}>
          <PlusIcon />
          Novo agendamento
        </Button>
      </div>

      <AppointmentsToolbar
        mode={mode}
        onModeChange={setMode}
        periodLabel={periodLabel}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      {isCalendarLoading ? (
        <AppointmentsCalendarSkeleton />
      ) : isCalendarError ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar os agendamentos.
        </p>
      ) : (
        <>
          {mode === "month" ? (
            <AppointmentMonthView
              anchor={anchor}
              appointments={appointments}
              onSelectDay={handleSelectDay}
              onSelectAppointment={handleSelectAppointment}
            />
          ) : null}

          {mode === "week" && weeklyHours ? (
            <AppointmentWeekView
              anchor={anchor}
              appointments={appointments}
              weeklyHours={weeklyHours}
              isMobile={isMobile}
              onSelectAppointment={handleSelectAppointment}
              onSelectSlot={handleSelectSlot}
            />
          ) : null}

          {mode === "day" && weeklyHours ? (
            <AppointmentDayView
              anchor={anchor}
              appointments={appointments}
              weeklyHours={weeklyHours}
              onSelectAppointment={handleSelectAppointment}
              onSelectSlot={handleSelectSlot}
            />
          ) : null}
        </>
      )}

      <AppointmentDetailDrawer
        appointment={detailAppointment}
        open={Boolean(detailAppointment)}
        onOpenChange={(open) => {
          if (!open) setDetailAppointment(null)
        }}
      />

      <AppointmentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        defaultStartsAt={formDefaultStartsAt}
      />
    </div>
  )
}
