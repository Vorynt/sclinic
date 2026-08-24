"use client";

import { addMinutes, isSameDay, startOfDay } from "date-fns";

import { cn } from "@/lib/utils";
import { AppointmentEventCard } from "@/modules/appointments/components/AppointmentEventCard";
import { CalendarNowLine } from "@/modules/appointments/components/CalendarNowLine";
import { ScheduleBlockEventCard } from "@/modules/appointments/components/ScheduleBlockEventCard";
import type { Appointment } from "@/modules/appointments/types/appointment";
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block";
import {
  type CalendarHourRange,
  getUnavailableMinuteRanges,
  isWithinOpenClinicMinutes,
} from "@/modules/appointments/utils/calendar-clinic-hours";
import { CALENDAR_SLOT_STEP_MINUTES } from "@/modules/appointments/utils/calendar-constants";
import { layoutOverlappingAppointments } from "@/modules/appointments/utils/event-layout";
import type { CalendarCardPreset } from "@/modules/clinics/types/clinic-calendar-settings";
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours";

type AppointmentTimeGridColumnProps = {
  day: Date;
  appointments: Appointment[];
  scheduleBlocks?: ScheduleBlock[];
  hourHeightPx: number;
  hourRange: CalendarHourRange;
  weeklyHours: ClinicWeeklyHours;
  cardFields?: CalendarCardPreset;
  slotStepMinutes?: number;
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectScheduleBlock?: (block: ScheduleBlock) => void;
  onSelectSlot: (date: Date) => void;
  className?: string;
};

export function AppointmentTimeGridColumn({
  day,
  appointments,
  scheduleBlocks = [],
  hourHeightPx,
  hourRange,
  weeklyHours,
  cardFields,
  slotStepMinutes = CALENDAR_SLOT_STEP_MINUTES,
  onSelectAppointment,
  onSelectScheduleBlock,
  onSelectSlot,
  className,
}: AppointmentTimeGridColumnProps) {
  const totalHours = hourRange.end - hourRange.start;
  const pxPerMinute = hourHeightPx / 60;
  const rangeStart = addMinutes(startOfDay(day), hourRange.start * 60);
  const rangeEnd = addMinutes(startOfDay(day), hourRange.end * 60);
  const unavailableRanges = getUnavailableMinuteRanges(
    weeklyHours,
    day,
    hourRange,
  );

  const dayAppointments = appointments.filter((appointment) =>
    isSameDay(appointment.startsAt, day),
  );
  const laidOut = layoutOverlappingAppointments(dayAppointments);
  const dayScheduleBlocks = scheduleBlocks.filter((block) =>
    isSameDay(block.startsAt, day),
  );

  function handleBackgroundClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const rawMinutes = offsetY / pxPerMinute;
    const steppedMinutes =
      Math.round(rawMinutes / slotStepMinutes) * slotStepMinutes;
    const minutesFromMidnight = hourRange.start * 60 + steppedMinutes;

    if (!isWithinOpenClinicMinutes(weeklyHours, day, minutesFromMidnight)) {
      return;
    }

    onSelectSlot(addMinutes(rangeStart, steppedMinutes));
  }

  return (
    <div
      className={cn("relative", className)}
      style={{ height: totalHours * hourHeightPx }}
      onClick={handleBackgroundClick}>
      {Array.from({ length: totalHours }, (_, index) => (
        <div
          key={index}
          className="absolute inset-x-0 border-t border-border/70"
          style={{ top: index * hourHeightPx }}
        />
      ))}

      <CalendarNowLine
        day={day}
        hourRange={hourRange}
        hourHeightPx={hourHeightPx}
      />

      {unavailableRanges.map((range) => {
        const topPx = (range.startMinutes - hourRange.start * 60) * pxPerMinute;
        const heightPx = (range.endMinutes - range.startMinutes) * pxPerMinute;

        return (
          <div
            key={`${range.startMinutes}-${range.endMinutes}`}
            aria-hidden
            title="Horário indisponível"
            className="pointer-events-none absolute inset-x-0 z-1 bg-muted/55 bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,var(--border)_6px,var(--border)_7px)]"
            style={{ top: topPx, height: heightPx }}
          />
        );
      })}

      {dayScheduleBlocks.map((block) => {
        const clampedStart = Math.max(
          block.startsAt.getTime(),
          rangeStart.getTime(),
        );
        const clampedEnd = Math.min(block.endsAt.getTime(), rangeEnd.getTime());
        if (clampedEnd <= clampedStart) return null;

        const topPx =
          ((clampedStart - rangeStart.getTime()) / 60_000) * pxPerMinute;
        const heightPx = Math.max(
          ((clampedEnd - clampedStart) / 60_000) * pxPerMinute,
          18,
        );

        return (
          <ScheduleBlockEventCard
            key={block.id}
            block={block}
            style={{
              top: topPx,
              height: heightPx,
              left: 2,
              right: 2,
              zIndex: 1,
            }}
            onClick={(event) => {
              event.stopPropagation();
              onSelectScheduleBlock?.(block);
            }}
          />
        );
      })}

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
          56,
        );
        const widthPercent = 100 / columnCount;
        const leftPercent = column * widthPercent;

        return (
          <AppointmentEventCard
            key={appointment.id}
            appointment={appointment}
            variant="block"
            cardFields={cardFields}
            style={{
              top: topPx,
              height: heightPx,
              left: `calc(${leftPercent}% + 2px)`,
              width: `calc(${widthPercent}% - 4px)`,
              zIndex: 2,
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
