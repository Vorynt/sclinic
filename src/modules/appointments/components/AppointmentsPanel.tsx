"use client"

import { PlusIcon } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { AppointmentDayView } from "@/modules/appointments/components/AppointmentDayView"
import { AppointmentDetailDrawer } from "@/modules/appointments/components/AppointmentDetailDrawer"
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import { AppointmentMonthView } from "@/modules/appointments/components/AppointmentMonthView"
import { AppointmentProfessionalFilter } from "@/modules/appointments/components/AppointmentProfessionalFilter"
import { AppointmentsCalendarSkeleton } from "@/modules/appointments/components/AppointmentsPageSkeleton"
import { AppointmentsToolbar } from "@/modules/appointments/components/AppointmentsToolbar"
import { AppointmentWeekView } from "@/modules/appointments/components/AppointmentWeekView"
import { ScheduleBlockFormDialog } from "@/modules/appointments/components/ScheduleBlockFormDialog"
import { isSelfScheduleOnlyRole } from "@/modules/appointments/constants/appointments"
import {
  useAppointmentsQuery,
  useCalendarClinicHoursQuery,
} from "@/modules/appointments/hooks/use-appointments"
import { useCalendarQueryParams } from "@/modules/appointments/hooks/use-calendar-query-params"
import { useScheduleBlocksQuery } from "@/modules/appointments/hooks/use-schedule-blocks"
import type {
  Appointment,
  AppointmentModality,
} from "@/modules/appointments/types/appointment"
import {
  getNextAnchor,
  getPeriodLabel,
  getPreviousAnchor,
  getVisibleRange,
} from "@/modules/appointments/utils/calendar-range"
import { useAuthSession } from "@/modules/authentication/hooks/use-auth"

export function AppointmentsPanel() {
  const isMobile = useIsMobile()
  const appliedMobileDefault = useRef(false)
  const sessionQuery = useAuthSession()
  const {
    mode,
    date: anchor,
    hasExplicitMode,
    setMode,
    setDate,
    setModeAndDate,
  } = useCalendarQueryParams()

  const [detailAppointment, setDetailAppointment] =
    useState<Appointment | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [formDefaultStartsAt, setFormDefaultStartsAt] = useState<
    Date | undefined
  >(undefined)
  const [blockDefaultStartsAt, setBlockDefaultStartsAt] = useState<
    Date | undefined
  >(undefined)
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<
    string[]
  >([])
  const [modalityFilter, setModalityFilter] = useState<
    AppointmentModality | "all"
  >("all")

  useEffect(() => {
    if (isMobile && !hasExplicitMode && !appliedMobileDefault.current) {
      setMode("day")
      appliedMobileDefault.current = true
    }
  }, [hasExplicitMode, isMobile, setMode])

  const roleKey = sessionQuery.data?.membership?.roleKey
  const showProfessionalFilter =
    Boolean(roleKey) && !isSelfScheduleOnlyRole(roleKey)

  const range = useMemo(() => getVisibleRange(mode, anchor), [mode, anchor])
  const periodLabel = useMemo(() => getPeriodLabel(mode, anchor), [mode, anchor])
  const listFilters = useMemo(
    () => ({
      ...range,
      professionalIds: showProfessionalFilter
        ? selectedProfessionalIds.length > 0
          ? selectedProfessionalIds
          : undefined
        : undefined,
      modality: modalityFilter === "all" ? undefined : modalityFilter,
    }),
    [range, selectedProfessionalIds, showProfessionalFilter, modalityFilter],
  )
  const appointmentsQuery = useAppointmentsQuery(listFilters)
  const scheduleBlocksQuery = useScheduleBlocksQuery(listFilters)
  const calendarHoursQuery = useCalendarClinicHoursQuery()
  const appointments = appointmentsQuery.data ?? []
  const scheduleBlocks = scheduleBlocksQuery.data ?? []
  const weeklyHours = calendarHoursQuery.data
  const isCalendarLoading =
    appointmentsQuery.isLoading ||
    scheduleBlocksQuery.isLoading ||
    (mode !== "month" && calendarHoursQuery.isLoading)
  const isCalendarError =
    appointmentsQuery.isError ||
    scheduleBlocksQuery.isError ||
    (mode !== "month" && calendarHoursQuery.isError)

  function handlePrevious() {
    setDate(getPreviousAnchor(mode, anchor))
  }

  function handleNext() {
    setDate(getNextAnchor(mode, anchor))
  }

  function handleToday() {
    setDate(new Date())
  }

  function handleSelectDay(date: Date) {
    setModeAndDate("day", date)
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

  function handleNewBlock() {
    setBlockDefaultStartsAt(undefined)
    setBlockDialogOpen(true)
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Agendamentos
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulte e organize a agenda de consultas da clínica.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleNewBlock}>
            Bloquear horário
          </Button>
          <Button type="button" onClick={handleNewAppointment}>
            <PlusIcon />
            Novo agendamento
          </Button>
        </div>
      </div>

      <AppointmentsToolbar
        mode={mode}
        onModeChange={setMode}
        periodLabel={periodLabel}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        modality={modalityFilter}
        onModalityChange={setModalityFilter}
      />

      {showProfessionalFilter ? (
        <AppointmentProfessionalFilter
          selectedIds={selectedProfessionalIds}
          onSelectedIdsChange={setSelectedProfessionalIds}
        />
      ) : null}

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
              scheduleBlocks={scheduleBlocks}
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
              scheduleBlocks={scheduleBlocks}
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
        onAppointmentChange={setDetailAppointment}
      />

      <AppointmentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        defaultStartsAt={formDefaultStartsAt}
      />

      <ScheduleBlockFormDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        defaultStartsAt={blockDefaultStartsAt}
        defaultProfessionalId={
          selectedProfessionalIds.length === 1
            ? selectedProfessionalIds[0]
            : null
        }
      />
    </div>
  )
}
