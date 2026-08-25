"use client";

import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AppointmentEventCard } from "@/modules/appointments/components/AppointmentEventCard";
import { AppointmentTimeGridColumn } from "@/modules/appointments/components/AppointmentTimeGridColumn";
import type { Appointment } from "@/modules/appointments/types/appointment";
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block";
import { resolveVisibleHourRange } from "@/modules/appointments/utils/calendar-clinic-hours";
import {
  CALENDAR_HOUR_HEIGHT_PX,
  CALENDAR_SLOT_STEP_MINUTES,
} from "@/modules/appointments/utils/calendar-constants";
import type { CalendarCardPreset } from "@/modules/clinics/types/clinic-calendar-settings";
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours";

type AppointmentDayViewProps = {
  anchor: Date;
  appointments: Appointment[];
  scheduleBlocks?: ScheduleBlock[];
  weeklyHours: ClinicWeeklyHours;
  isMobile: boolean;
  hourHeightPx?: number;
  slotStepMinutes?: number;
  cardFields?: CalendarCardPreset;
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectScheduleBlock?: (block: ScheduleBlock) => void;
  onSelectSlot?: (date: Date) => void;
};

export function AppointmentDayView({
  anchor,
  appointments,
  scheduleBlocks = [],
  weeklyHours,
  isMobile,
  hourHeightPx = CALENDAR_HOUR_HEIGHT_PX,
  slotStepMinutes = CALENDAR_SLOT_STEP_MINUTES,
  cardFields,
  onSelectAppointment,
  onSelectScheduleBlock,
  onSelectSlot,
}: AppointmentDayViewProps) {
  if (isMobile) {
    const dayAppointments = appointments
      .filter((appointment) => isSameDay(appointment.startsAt, anchor))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-heading text-sm font-medium text-foreground capitalize",
              isToday(anchor) && "text-primary",
            )}>
            {format(anchor, "EEEE, dd 'de' MMM", { locale: ptBR })}
          </span>
        </div>

        {dayAppointments.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum agendamento</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {dayAppointments.map((appointment) => (
              <AppointmentEventCard
                key={appointment.id}
                appointment={appointment}
                variant="inline"
                cardFields={cardFields}
                className="h-auto py-1.5 text-xs"
                onClick={() => onSelectAppointment(appointment)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const hourRange = resolveVisibleHourRange(weeklyHours, [anchor]);
  const hourMarks = Array.from(
    { length: hourRange.end - hourRange.start },
    (_, index) => hourRange.start + index,
  );
  const gridHeight = (hourRange.end - hourRange.start) * hourHeightPx;

  return (
    <ScrollArea className="max-h-[min(70vh,calc(100dvh-14rem))] rounded-lg border md:max-h-[70vh]">
      <div className="grid grid-cols-[3.5rem_1fr] pt-4">
        <div className="relative border-r" style={{ height: gridHeight }}>
          {hourMarks.map((hour, index) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground"
              style={{ top: index * hourHeightPx }}>
              {String(hour).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        <AppointmentTimeGridColumn
          day={anchor}
          appointments={appointments}
          scheduleBlocks={scheduleBlocks}
          hourHeightPx={hourHeightPx}
          hourRange={hourRange}
          weeklyHours={weeklyHours}
          cardFields={cardFields}
          slotStepMinutes={slotStepMinutes}
          onSelectAppointment={onSelectAppointment}
          onSelectScheduleBlock={onSelectScheduleBlock}
          onSelectSlot={onSelectSlot}
        />
      </div>
    </ScrollArea>
  );
}
