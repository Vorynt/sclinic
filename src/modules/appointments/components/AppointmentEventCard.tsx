"use client";

import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { getProfessionalCalendarColor } from "@/modules/appointments/constants/appointments";
import type { Appointment } from "@/modules/appointments/types/appointment";

type AppointmentEventCardProps = {
  appointment: Appointment;
  /** `chip` = compact pill (month grid / mobile agenda). `block` = absolutely positioned time-grid card. */
  variant?: "chip" | "block";
  style?: React.CSSProperties;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
};

export function AppointmentEventCard({
  appointment,
  variant = "block",
  style,
  className,
  onClick,
}: AppointmentEventCardProps) {
  const isCanceled = appointment.status === "canceled";
  const color = getProfessionalCalendarColor(appointment.professionalId);

  const colorStyle: React.CSSProperties = {
    ...style,
    color: `color-mix(in srgb, ${color} 25%, black)`,
    backgroundColor: `color-mix(in srgb, ${color} 100%, transparent)`,
    borderColor: `color-mix(in srgb, ${color} 100%, transparent)`,
  };

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={onClick}
        style={colorStyle}
        data-canceled={isCanceled}
        aria-label={`${appointment.patientName} - ${format(appointment.startsAt, "HH:mm")} - ${format(appointment.endsAt, "HH:mm")}`}
        className={cn(
          "flex w-full items-center gap-1 truncate rounded-sm border px-1.5 py-0.5 text-left text-[0.7rem] leading-tight font-medium text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "data-[canceled=true]:opacity-60 data-[canceled=true]:line-through",
          "hover:z-10 hover:min-h-fit focus-visible:min-h-fit",
          className,
        )}>
        <span className="truncate">
          {format(appointment.startsAt, "HH:mm")} {appointment.patientName}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      data-slot="appointment-event-card"
      onClick={onClick}
      style={colorStyle}
      data-canceled={isCanceled}
      aria-label={`${appointment.patientName} - ${format(appointment.startsAt, "HH:mm")} - ${format(appointment.endsAt, "HH:mm")}`}
      className={cn(
        "group/appointment-event-card absolute flex flex-col @container/appointment-event-card rounded-md border px-1.5 py-1 text-left text-foreground dark:text-background shadow-sm outline-none hover:z-20 hover:shadow-md focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring",
        "hover:z-10 hover:min-h-fit focus-visible:min-h-fit transition-[opacity,shadow,transform]",
        className,
      )}>
      <span
        className={cn(
          "truncate text-xs font-semibold",
          "group-data-[canceled=true]/appointment-event-card:line-through group-hover/appointment-event-card:z-0",
        )}>
        {appointment.patientName}
      </span>
      <span className="truncate opacity-80 text-xs">
        {format(appointment.startsAt, "HH:mm")}–
        {format(appointment.endsAt, "HH:mm")}
      </span>
      {appointment.professionalName ? (
        <span className="truncate opacity-70 text-xs">
          {appointment.professionalName}
        </span>
      ) : null}
    </button>
  );
}
