"use client";

import { eachDayOfInterval, format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AppointmentEventCard } from "@/modules/appointments/components/AppointmentEventCard";
import { AppointmentTimeGridColumn } from "@/modules/appointments/components/AppointmentTimeGridColumn";
import type { Appointment } from "@/modules/appointments/types/appointment";
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block";
import { resolveVisibleHourRange } from "@/modules/appointments/utils/calendar-clinic-hours";
import { CALENDAR_HOUR_HEIGHT_PX } from "@/modules/appointments/utils/calendar-constants";
import { getVisibleRange } from "@/modules/appointments/utils/calendar-range";
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours";

type AppointmentWeekViewProps = {
  anchor: Date;
  appointments: Appointment[];
  scheduleBlocks?: ScheduleBlock[];
  weeklyHours: ClinicWeeklyHours;
  isMobile: boolean;
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectSlot: (date: Date) => void;
};

export function AppointmentWeekView({
  anchor,
  appointments,
  scheduleBlocks = [],
  weeklyHours,
  isMobile,
  onSelectAppointment,
  onSelectSlot,
}: AppointmentWeekViewProps) {
  const { from, to } = getVisibleRange("week", anchor);
  const days = eachDayOfInterval({ start: from, end: to });
  const hourRange = resolveVisibleHourRange(weeklyHours, days);

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {days.map((day) => {
          const dayAppointments = appointments
            .filter((appointment) => isSameDay(appointment.startsAt, day))
            .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

          return (
            <div key={day.toISOString()} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-heading text-sm font-medium text-foreground capitalize",
                    isToday(day) && "text-primary",
                  )}>
                  {format(day, "EEEE, dd 'de' MMM", { locale: ptBR })}
                </span>
              </div>

              {dayAppointments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum agendamento
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {dayAppointments.map((appointment) => (
                    <AppointmentEventCard
                      key={appointment.id}
                      appointment={appointment}
                      variant="chip"
                      className="h-auto py-1.5 text-xs"
                      onClick={() => onSelectAppointment(appointment)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const hourMarks = Array.from(
    { length: hourRange.end - hourRange.start },
    (_, index) => hourRange.start + index,
  );
  const gridHeight =
    (hourRange.end - hourRange.start) * CALENDAR_HOUR_HEIGHT_PX;

  return (
    <ScrollArea className="max-h-[70vh] rounded-lg border">
      <div className="grid grid-cols-[3rem_repeat(7,1fr)]">
        <div className="sticky top-0 border-r bg-background" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "sticky top-0 z-10 not-last:border-r flex flex-col items-center gap-0.5 border-b bg-background py-1.5",
            )}>
            <span className="text-[0.65rem] font-medium text-muted-foreground uppercase">
              {format(day, "EEEEEE", { locale: ptBR })}
            </span>
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-medium text-foreground",
                isToday(day) && "bg-primary text-primary-foreground",
              )}>
              {format(day, "d")}
            </span>
          </div>
        ))}

        <div className="relative border-r" style={{ height: gridHeight }}>
          {hourMarks.map((hour, index) => (
            <span
              key={hour}
              className="absolute right-1.5 -translate-y-1/2 text-[0.65rem] text-muted-foreground"
              style={{ top: index * CALENDAR_HOUR_HEIGHT_PX }}>
              {String(hour).padStart(2, "0")}h
            </span>
          ))}
        </div>

        {days.map((day) => (
          <AppointmentTimeGridColumn
            key={day.toISOString()}
            day={day}
            appointments={appointments}
            scheduleBlocks={scheduleBlocks}
            hourHeightPx={CALENDAR_HOUR_HEIGHT_PX}
            hourRange={hourRange}
            weeklyHours={weeklyHours}
            onSelectAppointment={onSelectAppointment}
            onSelectSlot={onSelectSlot}
            className={cn("border-r", isToday(day) && "bg-primary/5")}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
