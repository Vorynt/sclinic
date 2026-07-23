"use client";

import { addMinutes, isSameDay, startOfDay } from "date-fns";

import { cn } from "@/lib/utils";
import { AppointmentEventCard } from "@/modules/appointments/components/AppointmentEventCard";
import type { Appointment } from "@/modules/appointments/types/appointment";
import {
  CALENDAR_HOUR_RANGE,
  CALENDAR_SLOT_STEP_MINUTES,
} from "@/modules/appointments/utils/calendar-constants";
import { layoutOverlappingAppointments } from "@/modules/appointments/utils/event-layout";

type AppointmentTimeGridColumnProps = {
  day: Date;
  appointments: Appointment[];
  hourHeightPx: number;
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectSlot: (date: Date) => void;
  className?: string;
};

export function AppointmentTimeGridColumn({
  day,
  appointments,
  hourHeightPx,
  onSelectAppointment,
  onSelectSlot,
  className,
}: AppointmentTimeGridColumnProps) {
  const totalHours = CALENDAR_HOUR_RANGE.end - CALENDAR_HOUR_RANGE.start;
  const pxPerMinute = hourHeightPx / 60;
  const rangeStart = addMinutes(
    startOfDay(day),
    CALENDAR_HOUR_RANGE.start * 60,
  );
  const rangeEnd = addMinutes(startOfDay(day), CALENDAR_HOUR_RANGE.end * 60);

  const dayAppointments = appointments.filter((appointment) =>
    isSameDay(appointment.startsAt, day),
  );
  const laidOut = layoutOverlappingAppointments(dayAppointments);

  function handleBackgroundClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const rawMinutes = offsetY / pxPerMinute;
    const steppedMinutes =
      Math.round(rawMinutes / CALENDAR_SLOT_STEP_MINUTES) *
      CALENDAR_SLOT_STEP_MINUTES;
    onSelectSlot(addMinutes(rangeStart, steppedMinutes));
  }

  return (
    <div
      className={cn(
        "relative",
        // Dim sibling cards in this day column while one is hovered (not empty background).
        "[&:has([data-slot=appointment-event-card]:hover)_[data-slot=appointment-event-card]:not(:hover)]:opacity-50",
        className,
      )}
      style={{ height: totalHours * hourHeightPx }}
      onClick={handleBackgroundClick}>
      {Array.from({ length: totalHours }, (_, index) => (
        <div
          key={index}
          className="absolute inset-x-0 border-t border-border/70"
          style={{ top: index * hourHeightPx }}
        />
      ))}

      {laidOut.map(({ appointment, column, columnCount }) => {
        const clampedStart = Math.max(
          appointment.startsAt.getTime(),
          rangeStart.getTime(),
        );
        const clampedEnd = Math.min(
          appointment.endsAt.getTime(),
          rangeEnd.getTime(),
        );
        if (clampedEnd <= clampedStart) return null;

        const topPx =
          ((clampedStart - rangeStart.getTime()) / 60_000) * pxPerMinute;
        const heightPx = Math.max(
          ((clampedEnd - clampedStart) / 60_000) * pxPerMinute,
          18,
        );
        const widthPercent = 100 / columnCount;
        const leftPercent = column * widthPercent;

        return (
          <AppointmentEventCard
            key={appointment.id}
            appointment={appointment}
            variant="block"
            style={{
              top: topPx,
              height: heightPx,
              left: `calc(${leftPercent}% + 2px)`,
              width: `calc(${widthPercent}% - 4px)`,
            }}
            onClick={(event) => {
              event.stopPropagation();
              onSelectAppointment(appointment);
            }}
          />
        );
      })}
    </div>
  );
}
