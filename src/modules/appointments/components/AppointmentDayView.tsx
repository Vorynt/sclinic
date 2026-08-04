"use client";

import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AppointmentTimeGridColumn } from "@/modules/appointments/components/AppointmentTimeGridColumn";
import type { Appointment } from "@/modules/appointments/types/appointment";
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block";
import { resolveVisibleHourRange } from "@/modules/appointments/utils/calendar-clinic-hours";
import { CALENDAR_HOUR_HEIGHT_PX } from "@/modules/appointments/utils/calendar-constants";
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours";

type AppointmentDayViewProps = {
  anchor: Date;
  appointments: Appointment[];
  scheduleBlocks?: ScheduleBlock[];
  weeklyHours: ClinicWeeklyHours;
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectSlot: (date: Date) => void;
};

export function AppointmentDayView({
  anchor,
  appointments,
  scheduleBlocks = [],
  weeklyHours,
  onSelectAppointment,
  onSelectSlot,
}: AppointmentDayViewProps) {
  const hourRange = resolveVisibleHourRange(weeklyHours, [anchor]);
  const hourMarks = Array.from(
    { length: hourRange.end - hourRange.start },
    (_, index) => hourRange.start + index,
  );
  const gridHeight =
    (hourRange.end - hourRange.start) * CALENDAR_HOUR_HEIGHT_PX;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-heading text-base font-medium text-foreground capitalize",
            isToday(anchor) && "text-primary",
          )}>
          {format(anchor, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </span>
      </div>

      <ScrollArea className="max-h-[75vh] rounded-lg border">
        <div className="grid grid-cols-[3.5rem_1fr] pt-4">
          <div className="relative border-r" style={{ height: gridHeight }}>
            {hourMarks.map((hour, index) => (
              <span
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground"
                style={{ top: index * CALENDAR_HOUR_HEIGHT_PX }}>
                {String(hour).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          <AppointmentTimeGridColumn
            day={anchor}
            appointments={appointments}
            scheduleBlocks={scheduleBlocks}
            hourHeightPx={CALENDAR_HOUR_HEIGHT_PX}
            hourRange={hourRange}
            weeklyHours={weeklyHours}
            onSelectAppointment={onSelectAppointment}
            onSelectSlot={onSelectSlot}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
