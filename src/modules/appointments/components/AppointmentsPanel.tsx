"use client";

import { CalendarPlusIcon, ProhibitInsetIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { QueryErrorState } from "@/components/status/QueryErrorState";
import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppointmentDayView } from "@/modules/appointments/components/AppointmentDayView";
import { AppointmentDetailDrawer } from "@/modules/appointments/components/AppointmentDetailDrawer";
import {
  AppointmentFiltersDrawer,
  type AppointmentFiltersValue,
} from "@/modules/appointments/components/AppointmentFiltersDrawer";
import { AppointmentFormDialog } from "@/modules/appointments/components/AppointmentFormDialog";
import { AppointmentMonthView } from "@/modules/appointments/components/AppointmentMonthView";
import { AppointmentsCalendarSkeleton } from "@/modules/appointments/components/AppointmentsPageSkeleton";
import { AppointmentsToolbar } from "@/modules/appointments/components/AppointmentsToolbar";
import { AppointmentWeekView } from "@/modules/appointments/components/AppointmentWeekView";
import { AppointmentCardExpandProvider } from "@/modules/appointments/components/appointment-card-expand-context";
import { ScheduleBlockDetailDialog } from "@/modules/appointments/components/ScheduleBlockDetailDialog";
import { ScheduleBlockFormDialog } from "@/modules/appointments/components/ScheduleBlockFormDialog";
import { isSelfScheduleOnlyRole } from "@/modules/appointments/constants/appointments";
import { useCalendarRangeQuery } from "@/modules/appointments/hooks/use-appointments";
import { useCalendarQueryParams } from "@/modules/appointments/hooks/use-calendar-query-params";
import type { Appointment } from "@/modules/appointments/types/appointment";
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block";
import { CALENDAR_HOUR_HEIGHT_PX } from "@/modules/appointments/utils/calendar-constants";
import {
  getNextAnchor,
  getPeriodLabel,
  getPreviousAnchor,
  getVisibleRange,
} from "@/modules/appointments/utils/calendar-range";
import {
  filterVisibleCalendarAppointments,
  resolveCalendarCardFields,
  resolveCalendarSettingsPreset,
} from "@/modules/appointments/utils/calendar-settings";
import { useAuthSession } from "@/modules/authentication/hooks/use-auth";
import { DEFAULT_CLINIC_CALENDAR_SETTINGS } from "@/modules/clinics/constants/default-calendar-settings";
import { useClinicCalendarSettings } from "@/modules/clinics/hooks/use-clinic-hours";
import { useAuth } from "@/providers/AuthProvider";
import type { PageAction } from "@/types/page-action";

export function AppointmentsPanel() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const appliedMobileDefault = useRef(false);
  const sessionQuery = useAuthSession();
  const { can } = useAuth();
  const canManageSettings = can(Permission.SETTINGS_MANAGE);
  const settingsQuery = useClinicCalendarSettings();
  const {
    mode,
    date: anchor,
    hasExplicitMode,
    setMode,
    setDate,
    setModeAndDate,
  } = useCalendarQueryParams();

  const calendarSettings =
    settingsQuery.data ?? DEFAULT_CLINIC_CALENDAR_SETTINGS;
  const roleKey = sessionQuery.data?.membership?.roleKey;
  const settingsPreset = resolveCalendarSettingsPreset(roleKey);
  const cardFields = resolveCalendarCardFields(calendarSettings, settingsPreset);
  const hourHeightPx = CALENDAR_HOUR_HEIGHT_PX;
  const weekStartsOn = calendarSettings.weekStartsOn;

  const [detailAppointment, setDetailAppointment] =
    useState<Appointment | null>(null);
  const [detailBlock, setDetailBlock] = useState<ScheduleBlock | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [formDefaultStartsAt, setFormDefaultStartsAt] = useState<
    Date | undefined
  >(undefined);
  const [blockDefaultStartsAt, setBlockDefaultStartsAt] = useState<
    Date | undefined
  >(undefined);
  const [filters, setFilters] = useState<AppointmentFiltersValue>({
    professionalIds: [],
    patientIds: [],
    modality: "all",
  });

  useEffect(() => {
    if (hasExplicitMode || appliedMobileDefault.current) return;
    if (typeof window === "undefined") return;
    if (!settingsQuery.isSuccess && !settingsQuery.isError) return;

    const isPhone = window.innerWidth < 768;
    const fallback = isPhone
      ? "day"
      : calendarSettings.defaultView[settingsPreset];
    setMode(fallback);
    appliedMobileDefault.current = true;
  }, [
    calendarSettings.defaultView,
    hasExplicitMode,
    setMode,
    settingsPreset,
    settingsQuery.isError,
    settingsQuery.isSuccess,
  ]);

  const showProfessionalFilter =
    Boolean(roleKey) && !isSelfScheduleOnlyRole(roleKey);

  const range = useMemo(
    () => getVisibleRange(mode, anchor, { weekStartsOn }),
    [mode, anchor, weekStartsOn],
  );
  const periodLabel = useMemo(
    () => getPeriodLabel(mode, anchor, { weekStartsOn }),
    [mode, anchor, weekStartsOn],
  );
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
  );
  const calendarRangeQuery = useCalendarRangeQuery({
    ...listFilters,
    includeHours: mode !== "month",
  });
  const appointments = filterVisibleCalendarAppointments(
    calendarRangeQuery.data?.appointments ?? [],
    calendarSettings.showCanceled,
  );
  const scheduleBlocks = calendarRangeQuery.data?.scheduleBlocks ?? [];
  const weeklyHours = calendarRangeQuery.data?.weeklyHours ?? undefined;
  const isCalendarLoading = calendarRangeQuery.isLoading;
  const isCalendarError = calendarRangeQuery.isError;

  function handlePrevious() {
    setDate(getPreviousAnchor(mode, anchor));
  }

  function handleNext() {
    setDate(getNextAnchor(mode, anchor));
  }

  function handleToday() {
    setDate(new Date());
  }

  function handleSelectDay(date: Date) {
    setModeAndDate("day", date);
  }

  function handleSelectAppointment(appointment: Appointment) {
    setDetailAppointment(appointment);
  }

  function handleSelectScheduleBlock(block: ScheduleBlock) {
    setDetailBlock(block);
  }

  function handleSelectSlot(date: Date) {
    setFormDefaultStartsAt(date);
    setFormDialogOpen(true);
  }

  const pageActions = useMemo<PageAction[]>(
    () => [
      {
        id: "block-slot",
        label: "Bloquear horário",
        icon: ProhibitInsetIcon,
        priority: "secondary",
        onClick: () => {
          setBlockDefaultStartsAt(undefined);
          setBlockDialogOpen(true);
        },
      },
      {
        id: "new-appointment",
        label: "Novo agendamento",
        icon: CalendarPlusIcon,
        priority: "primary",
        onClick: () => {
          router.push(routes.appointmentNew);
        },
      },
    ],
    [router],
  );

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="Agendamentos"
        description="Consulte e organize a agenda de consultas da clínica."
        actions={pageActions}
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
        settingsHref={
          canManageSettings ? routes.settingsCalendar : undefined
        }
      />

      {isCalendarLoading ? (
        <AppointmentsCalendarSkeleton
          mode={mode}
          isMobile={isMobile}
          anchor={anchor}
        />
      ) : isCalendarError ? (
        <QueryErrorState
          description="Não foi possível carregar os agendamentos."
          onRetry={() => {
            void calendarRangeQuery.refetch();
          }}
          isRetrying={
            calendarRangeQuery.isFetching
          }
        />
      ) : (
        <AppointmentCardExpandProvider key={mode}>
          {mode === "month" ? (
            <AppointmentMonthView
              anchor={anchor}
              appointments={appointments}
              weekStartsOn={weekStartsOn}
              cardFields={cardFields}
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
              weekStartsOn={weekStartsOn}
              hourHeightPx={hourHeightPx}
              slotStepMinutes={calendarSettings.slotStepMinutes}
              cardFields={cardFields}
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
              isMobile={isMobile}
              hourHeightPx={hourHeightPx}
              slotStepMinutes={calendarSettings.slotStepMinutes}
              cardFields={cardFields}
              onSelectAppointment={handleSelectAppointment}
              onSelectScheduleBlock={handleSelectScheduleBlock}
              onSelectSlot={handleSelectSlot}
            />
          ) : null}
        </AppointmentCardExpandProvider>
      )}

      <AppointmentDetailDrawer
        appointment={detailAppointment}
        open={Boolean(detailAppointment)}
        onOpenChange={(open) => {
          if (!open) setDetailAppointment(null);
        }}
        onAppointmentChange={setDetailAppointment}
      />

      <ScheduleBlockDetailDialog
        block={detailBlock}
        open={Boolean(detailBlock)}
        onOpenChange={(open) => {
          if (!open) setDetailBlock(null);
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
  );
}
