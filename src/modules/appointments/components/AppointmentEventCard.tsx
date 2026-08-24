"use client";

import { ArrowsInIcon, ArrowsOutIcon } from "@phosphor-icons/react";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type RefObject,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppointmentCardExpand } from "@/modules/appointments/components/appointment-card-expand-context";
import {
  APPOINTMENT_CALENDAR_STATUS_LABELS,
  getProfessionalCalendarColor,
} from "@/modules/appointments/constants/appointments";
import type { Appointment } from "@/modules/appointments/types/appointment";
import {
  formatAppointmentStartTime,
  formatAppointmentTimeRange,
  getAppointmentCardExtraFields,
} from "@/modules/appointments/utils/calendar-settings";
import { DEFAULT_CLINICAL_CARD_PRESET } from "@/modules/clinics/constants/default-calendar-settings";
import type { CalendarCardPreset } from "@/modules/clinics/types/clinic-calendar-settings";

type AppointmentEventCardProps = {
  appointment: Appointment;
  /** `chip` = month grid. `block` = time-grid. `inline` = mobile/list/preview. */
  variant?: "chip" | "block" | "inline";
  cardFields?: CalendarCardPreset;
  style?: CSSProperties;
  className?: string;
  onClick?: (event: MouseEvent) => void;
};

const CARD_SURFACE_CLASS =
  "border-black/10 bg-[oklch(from_var(--appointment-accent)_0.94_0.05_h)] text-[oklch(from_var(--appointment-accent)_0.28_0.08_h)] dark:border-white/15 dark:bg-[oklch(from_var(--appointment-accent)_0.28_0.06_h)] dark:text-[oklch(from_var(--appointment-accent)_0.93_0.04_h)]";

const EXPANDED_SURFACE_CLASS =
  "bg-[oklch(from_var(--appointment-accent)_0.96_0.04_h)] dark:bg-[oklch(from_var(--appointment-accent)_0.22_0.05_h)]";

function AppointmentStatusBadge({
  status,
  className,
}: {
  status: Appointment["status"];
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-4 border-current/25 bg-white px-1.5 text-[0.65rem] leading-none font-medium dark:bg-black",
        className,
      )}>
      {APPOINTMENT_CALENDAR_STATUS_LABELS[status]}
    </Badge>
  );
}

function CardFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="text-[0.6rem] leading-tight font-medium tracking-wide uppercase opacity-60">
        {label}
      </span>
      <span className="truncate text-[0.7rem] leading-tight">{value}</span>
    </span>
  );
}

function appointmentAccentStyle(
  professionalId: string | null,
  style?: CSSProperties,
): CSSProperties {
  const color = getProfessionalCalendarColor(professionalId);
  return {
    ...style,
    ["--appointment-accent" as string]: color,
    borderLeftColor: color,
  };
}

const EXTRA_LINE_HEIGHT_PX = 16;
const EXTRA_LINE_GAP_PX = 2;

function countFittingExtras(card: HTMLElement, extraCount: number): number {
  if (extraCount === 0) return 0;

  const header = card.querySelector<HTMLElement>("[data-card-header]");
  if (!header) return extraCount;

  const styles = getComputedStyle(card);
  const paddingY =
    (Number.parseFloat(styles.paddingTop) || 0) +
    (Number.parseFloat(styles.paddingBottom) || 0);
  const leftover = card.clientHeight - header.offsetHeight - paddingY;
  if (leftover < EXTRA_LINE_HEIGHT_PX) return 0;

  return Math.min(
    extraCount,
    Math.floor(
      (leftover + EXTRA_LINE_GAP_PX) /
        (EXTRA_LINE_HEIGHT_PX + EXTRA_LINE_GAP_PX),
    ),
  );
}

function useVisibleExtraCount(
  cardRef: RefObject<HTMLElement | null>,
  extraCount: number,
  enabled: boolean,
) {
  const [visibleCount, setVisibleCount] = useState(extraCount);

  useLayoutEffect(() => {
    if (!enabled) {
      setVisibleCount(extraCount);
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const measure = () => {
      setVisibleCount(countFittingExtras(card, extraCount));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [cardRef, enabled, extraCount]);

  return visibleCount;
}

export function AppointmentEventCard({
  appointment,
  variant = "block",
  cardFields = DEFAULT_CLINICAL_CARD_PRESET,
  style,
  className,
  onClick,
}: AppointmentEventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { expanded, toggle } = useAppointmentCardExpand(appointment.id);
  const isCanceled = appointment.status === "canceled";
  const isInline = variant === "inline";
  const isChip = variant === "chip";
  const isBlock = variant === "block";
  const statusLabel = APPOINTMENT_CALENDAR_STATUS_LABELS[appointment.status];
  const timeRange = formatAppointmentTimeRange(appointment);
  const ariaLabel = `${appointment.patientName} - ${timeRange} - ${statusLabel}`;
  const extraFields = getAppointmentCardExtraFields(appointment, cardFields);
  const measureExtras = isBlock && !expanded;
  const visibleExtraCount = useVisibleExtraCount(
    cardRef,
    extraFields.length,
    measureExtras,
  );
  const canExpand = extraFields.length > visibleExtraCount;
  const showExpandButton = canExpand || expanded;
  const startTime = formatAppointmentStartTime(appointment);

  if (isChip) {
    return (
      <div className={cn("relative h-5", expanded && "z-50")}>
        <div
          data-slot="appointment-event-card"
          data-canceled={isCanceled}
          data-expanded={expanded}
          style={appointmentAccentStyle(appointment.professionalId, style)}
          onClick={(event) => {
            event.stopPropagation();
          }}
          className={cn(
            "flex w-full rounded-sm border border-l-[3px] px-1.5",
            CARD_SURFACE_CLASS,
            expanded
              ? "absolute inset-x-0 top-0 z-50 h-auto flex-col py-1 shadow-lg"
              : "h-5 items-center",
            expanded && EXPANDED_SURFACE_CLASS,
            "data-[canceled=true]:data-[expanded=false]:opacity-70",
            className,
          )}>
          <div className="flex min-w-0 items-center gap-0.5">
            <button
              type="button"
              onClick={onClick}
              aria-label={ariaLabel}
              className="flex min-w-0 flex-1 items-center gap-1 text-left text-[0.7rem] leading-none outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {expanded ? (
                <>
                  <AppointmentStatusBadge
                    status={appointment.status}
                    className="shrink-0 px-1"
                  />
                  <span
                    className={cn(
                      "truncate font-medium",
                      isCanceled && "line-through",
                    )}>
                    {appointment.patientName}
                  </span>
                </>
              ) : (
                <>
                  <span className="shrink-0 tabular-nums opacity-80">
                    {startTime}
                  </span>
                  <span
                    className={cn(
                      "truncate font-medium",
                      isCanceled && "line-through",
                    )}>
                    {appointment.patientName}
                  </span>
                </>
              )}
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              tooltip={expanded ? "Recolher card" : "Expandir card"}
              aria-label={expanded ? "Recolher card" : "Expandir card"}
              aria-expanded={expanded}
              className="size-4 shrink-0 opacity-80 hover:bg-current/10 hover:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
                toggle();
              }}>
              {expanded ? <ArrowsInIcon /> : <ArrowsOutIcon />}
            </Button>
          </div>

          {expanded ? (
            <span className="mt-1 flex flex-col gap-1">
              <CardFieldRow label="Horário" value={timeRange} />
              {extraFields.map((field) => (
                <CardFieldRow
                  key={field.id}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  const { height, zIndex, ...restStyle } = style ?? {};
  const cardStyle = appointmentAccentStyle(appointment.professionalId, {
    ...restStyle,
    ...(isBlock
      ? {
          minHeight: height,
          height: expanded ? "auto" : height,
          zIndex: expanded ? 40 : zIndex,
        }
      : undefined),
  });

  return (
    <div
      ref={cardRef}
      data-slot="appointment-event-card"
      data-canceled={isCanceled}
      data-expanded={expanded}
      style={cardStyle}
      onClick={(event) => {
        event.stopPropagation();
      }}
      className={cn(
        "flex flex-col rounded-md border border-l-[3px] px-1.5 py-1 shadow-sm",
        CARD_SURFACE_CLASS,
        isInline && "relative w-full",
        isBlock && "absolute overflow-hidden",
        "data-[expanded=true]:z-40 data-[expanded=true]:isolate data-[expanded=true]:overflow-hidden data-[expanded=true]:opacity-100 data-[expanded=true]:shadow-lg",
        expanded && EXPANDED_SURFACE_CLASS,
        "hover:z-20 hover:shadow-md",
        "data-[canceled=true]:data-[expanded=false]:opacity-70 ",
        className,
      )}>
      <div className="flex min-w-0 items-start gap-0.5">
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          className="flex min-w-0 flex-1 flex-col gap-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span data-card-header className="flex min-w-0 flex-col gap-0.5">
            <AppointmentStatusBadge
              status={appointment.status}
              className="self-start"
            />
            <span
              className={cn(
                "truncate text-xs font-semibold",
                isCanceled && "line-through",
              )}>
              {appointment.patientName}
            </span>
            {expanded ? (
              <CardFieldRow label="Horário" value={timeRange} />
            ) : (
              <span className="truncate text-xs opacity-80">{timeRange}</span>
            )}
          </span>

          {expanded
            ? extraFields.map((field) => (
                <CardFieldRow
                  key={field.id}
                  label={field.label}
                  value={field.value}
                />
              ))
            : extraFields.slice(0, visibleExtraCount).map((field) => (
                <span
                  key={field.id}
                  className="truncate text-[0.65rem] leading-tight opacity-75">
                  {field.value}
                </span>
              ))}
        </button>

        {showExpandButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            tooltip={expanded ? "Recolher card" : "Expandir card"}
            aria-label={expanded ? "Recolher card" : "Expandir card"}
            aria-expanded={expanded}
            className="size-5 shrink-0 opacity-80 hover:bg-current/10 hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              toggle();
            }}>
            {expanded ? <ArrowsInIcon /> : <ArrowsOutIcon />}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
