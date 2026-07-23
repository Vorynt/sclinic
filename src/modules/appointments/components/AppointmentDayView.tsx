"use client";

import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AppointmentTimeGridColumn } from "@/modules/appointments/components/AppointmentTimeGridColumn";
import type { Appointment } from "@/modules/appointments/types/appointment";
import { CALENDAR_HOUR_RANGE } from "@/modules/appointments/utils/calendar-constants";

const DAY_HOUR_HEIGHT_PX = 72;

type AppointmentDayViewProps = {
  anchor: Date;
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectSlot: (date: Date) => void;
};

export function AppointmentDayView({
  anchor,
  appointments,
  onSelectAppointment,
  onSelectSlot,
}: AppointmentDayViewProps) {
  const hourMarks = Array.from(
    { length: CALENDAR_HOUR_RANGE.end - CALENDAR_HOUR_RANGE.start },
    (_, index) => CALENDAR_HOUR_RANGE.start + index,
  );
  const gridHeight =
    (CALENDAR_HOUR_RANGE.end - CALENDAR_HOUR_RANGE.start) * DAY_HOUR_HEIGHT_PX;

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
                style={{ top: index * DAY_HOUR_HEIGHT_PX }}>
                {String(hour).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          <AppointmentTimeGridColumn
            day={anchor}
            appointments={appointments}
            hourHeightPx={DAY_HOUR_HEIGHT_PX}
            onSelectAppointment={onSelectAppointment}
            onSelectSlot={onSelectSlot}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
