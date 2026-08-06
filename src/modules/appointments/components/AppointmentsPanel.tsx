"use client"

import { PlusIcon } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { PageHeader } from "@/components/layout/PageHeader"
import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { AppointmentDayView } from "@/modules/appointments/components/AppointmentDayView"
import { AppointmentDetailDrawer } from "@/modules/appointments/components/AppointmentDetailDrawer"
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog"
import { AppointmentMonthView } from "@/modules/appointments/components/AppointmentMonthView"
import {
  AppointmentFiltersDrawer,
  type AppointmentFiltersValue,
} from "@/modules/appointments/components/AppointmentFiltersDrawer"
import { AppointmentsCalendarSkeleton } from "@/modules/appointments/components/AppointmentsPageSkeleton"
import { AppointmentsToolbar } from "@/modules/appointments/components/AppointmentsToolbar"
import { AppointmentWeekView } from "@/modules/appointments/components/AppointmentWeekView"
import { ScheduleBlockDetailDialog } from "@/modules/appointments/components/ScheduleBlockDetailDialog"
import { ScheduleBlockFormDialog } from "@/modules/appointments/components/ScheduleBlockFormDialog"
import { isSelfScheduleOnlyRole } from "@/modules/appointments/constants/appointments"
import {
  useAppointmentsQuery,
  useCalendarClinicHoursQuery,
} from "@/modules/appointments/hooks/use-appointments"
import { useCalendarQueryParams } from "@/modules/appointments/hooks/use-calendar-query-params"
import { useScheduleBlocksQuery } from "@/modules/appointments/hooks/use-schedule-blocks"
import type { Appointment } from "@/modules/appointments/types/appointment"
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block"
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
  const [detailBlock, setDetailBlock] = useState<ScheduleBlock | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [formDefaultStartsAt, setFormDefaultStartsAt] = useState<
    Date | undefined
  >(undefined)
  const [blockDefaultStartsAt, setBlockDefaultStartsAt] = useState<
    Date | undefined
  >(undefined)
  const [filters, setFilters] = useState<AppointmentFiltersValue>({
    professionalIds: [],
    patientIds: [],
    modality: "all",
  })

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
        ? filters.professionalIds.length > 0
          ? filters.professionalIds
          : undefined
        : undefined,
      patientIds:
        filters.patientIds.length > 0 ? filters.patientIds : undefined,
      modality: filters.modality === "all" ? undefined : filters.modality,
    }),
    [range, filters, showProfessionalFilter],
  )
  const appointmentsQuery = useAppointmentsQuery(listFilters)
  const scheduleBlocksQuery = useScheduleBlocksQuery({
    ...range,
    professionalIds: listFilters.professionalIds,
  })
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

  function handleSelectScheduleBlock(block: ScheduleBlock) {
    setDetailBlock(block)
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
      <PageHeader
        title="Agendamentos"
        description="Consulte e organize a agenda de consultas da clínica."
        actions={
          <>
            <Button type="button" variant="outline" onClick={handleNewBlock}>
              Bloquear horário
            </Button>
            <Button type="button" onClick={handleNewAppointment}>
              <PlusIcon />
              Novo agendamento
            </Button>
          </>
        }
      />

      <AppointmentsToolbar
        mode={mode}
        onModeChange={setMode}
        periodLabel={periodLabel}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        filters={
          <AppointmentFiltersDrawer
            value={filters}
            onValueChange={setFilters}
            showProfessionalFilter={showProfessionalFilter}
          />
        }
      />

      {isCalendarLoading ? (
        <AppointmentsCalendarSkeleton />
      ) : isCalendarError ? (
        <QueryErrorState
          description="Não foi possível carregar os agendamentos."
          onRetry={() => {
            void appointmentsQuery.refetch()
            void scheduleBlocksQuery.refetch()
            if (mode !== "month") {
              void calendarHoursQuery.refetch()
            }
          }}
          isRetrying={
            appointmentsQuery.isFetching ||
            scheduleBlocksQuery.isFetching ||
            (mode !== "month" && calendarHoursQuery.isFetching)
          }
        />
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
              onSelectScheduleBlock={handleSelectScheduleBlock}
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
              onSelectScheduleBlock={handleSelectScheduleBlock}
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

      <ScheduleBlockDetailDialog
        block={detailBlock}
        open={Boolean(detailBlock)}
        onOpenChange={(open) => {
          if (!open) setDetailBlock(null)
        }}
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
          filters.professionalIds.length === 1
            ? filters.professionalIds[0]
            : null
        }
      />
    </div>
  )
}
