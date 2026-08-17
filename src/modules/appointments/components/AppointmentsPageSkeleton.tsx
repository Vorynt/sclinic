import { eachDayOfInterval, format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { PageHeaderSkeleton } from "@/components/status/PageHeaderSkeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CALENDAR_HOUR_HEIGHT_PX,
  CALENDAR_HOUR_RANGE,
} from "@/modules/appointments/utils/calendar-constants"
import {
  getVisibleRange,
  type CalendarViewMode,
} from "@/modules/appointments/utils/calendar-range"

type AppointmentsMonthSkeletonProps = {
  anchor?: Date
}

/** Calendar grid silhouette matching AppointmentMonthView. */
export function AppointmentsMonthSkeleton({
  anchor = new Date(),
}: AppointmentsMonthSkeletonProps) {
  const { from, to } = getVisibleRange("month", anchor)
  const days = eachDayOfInterval({ start: from, end: to })
  const weekdayLabels = days
    .slice(0, 7)
    .map((day) => format(day, "EEEEEE", { locale: ptBR }))

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-7 gap-px text-center text-[0.65rem] font-medium text-muted-foreground uppercase sm:text-xs">
        {weekdayLabels.map((label, index) => (
          <span key={index} className="capitalize">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
        {days.map((day, index) => (
          <div
            key={day.toISOString()}
            className="flex min-h-20 flex-col gap-0.5 bg-background p-1 sm:min-h-28 sm:p-1.5"
          >
            <Skeleton className="size-5 shrink-0 self-end rounded-full" />
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              {index % 3 === 0 ? (
                <>
                  <Skeleton className="h-3 w-full rounded-sm" />
                  <Skeleton className="h-3 w-4/5 rounded-sm" />
                </>
              ) : null}
              {index % 5 === 0 ? (
                <Skeleton className="h-3 w-3/5 rounded-sm" />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type AppointmentsMobileListSkeletonProps = {
  mode: "week" | "day"
}

/** List silhouette matching mobile week/day views. */
function AppointmentsMobileListSkeleton({
  mode,
}: AppointmentsMobileListSkeletonProps) {
  const dayCount = mode === "week" ? 7 : 1
  const chipCounts = mode === "week" ? [2, 0, 1, 3, 0, 1, 2] : [3, 2, 1]

  return (
    <div
      className={mode === "week" ? "flex flex-col gap-4" : "flex flex-col gap-1.5"}
    >
      {Array.from({ length: dayCount }, (_, dayIndex) => {
        const chipCount = chipCounts[dayIndex] ?? 0

        return (
          <div
            key={dayIndex}
            className={mode === "week" ? "flex flex-col gap-1.5" : undefined}
          >
            <Skeleton className="h-4 w-48" />
            {chipCount === 0 ? (
              <Skeleton className="h-3 w-36" />
            ) : (
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: chipCount }, (_, chipIndex) => (
                  <Skeleton
                    key={chipIndex}
                    className="h-6 w-full rounded-sm"
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

type AppointmentsTimeGridSkeletonProps = {
  mode: "week" | "day"
}

/** Time grid silhouette matching desktop week/day views. */
function AppointmentsTimeGridSkeleton({ mode }: AppointmentsTimeGridSkeletonProps) {
  const hourRange = CALENDAR_HOUR_RANGE
  const hourMarks = Array.from(
    { length: hourRange.end - hourRange.start },
    (_, index) => hourRange.start + index,
  )
  const gridHeight =
    (hourRange.end - hourRange.start) * CALENDAR_HOUR_HEIGHT_PX
  const columnCount = mode === "week" ? 7 : 1

  if (mode === "week") {
    return (
      <ScrollArea className="max-h-[min(70vh,calc(100dvh-14rem))] rounded-lg border md:max-h-[70vh]">
        <div className="grid grid-cols-[3rem_repeat(7,1fr)]">
          <div className="sticky top-0 border-r bg-background" />
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className="sticky top-0 z-10 flex flex-col items-center gap-0.5 border-b bg-background py-1.5 not-last:border-r"
            >
              <Skeleton className="h-2.5 w-6" />
              <Skeleton className="size-6 rounded-full" />
            </div>
          ))}

          <div className="relative border-r" style={{ height: gridHeight }}>
            {hourMarks.map((hour, index) => (
              <span
                key={hour}
                className="absolute right-1.5 -translate-y-1/2 text-[0.65rem] text-muted-foreground"
                style={{ top: index * CALENDAR_HOUR_HEIGHT_PX }}
              >
                {String(hour).padStart(2, "0")}h
              </span>
            ))}
          </div>

          {Array.from({ length: columnCount }, (_, columnIndex) => (
            <div
              key={columnIndex}
              className="relative border-r"
              style={{ height: gridHeight }}
            >
              {hourMarks.map((hour) => (
                <div
                  key={hour}
                  className="absolute inset-x-0 border-b border-border/60"
                  style={{
                    top: (hour - hourRange.start) * CALENDAR_HOUR_HEIGHT_PX,
                    height: CALENDAR_HOUR_HEIGHT_PX,
                  }}
                />
              ))}
              {columnIndex % 3 === 0 ? (
                <Skeleton
                  className="absolute inset-x-1 rounded-sm"
                  style={{
                    top: CALENDAR_HOUR_HEIGHT_PX * 2,
                    height: CALENDAR_HOUR_HEIGHT_PX,
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="max-h-[min(70vh,calc(100dvh-14rem))] rounded-lg border md:max-h-[70vh]">
      <div className="grid grid-cols-[3.5rem_1fr] pt-4">
        <div className="relative border-r" style={{ height: gridHeight }}>
          {hourMarks.map((hour, index) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground"
              style={{ top: index * CALENDAR_HOUR_HEIGHT_PX }}
            >
              {String(hour).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        <div className="relative" style={{ height: gridHeight }}>
          {hourMarks.map((hour) => (
            <div
              key={hour}
              className="absolute inset-x-0 border-b border-border/60"
              style={{
                top: (hour - hourRange.start) * CALENDAR_HOUR_HEIGHT_PX,
                height: CALENDAR_HOUR_HEIGHT_PX,
              }}
            />
          ))}
          <Skeleton
            className="absolute inset-x-2 rounded-sm"
            style={{
              top: CALENDAR_HOUR_HEIGHT_PX * 3,
              height: CALENDAR_HOUR_HEIGHT_PX,
            }}
          />
          <Skeleton
            className="absolute inset-x-2 rounded-sm"
            style={{
              top: CALENDAR_HOUR_HEIGHT_PX * 6,
              height: CALENDAR_HOUR_HEIGHT_PX / 2,
            }}
          />
        </div>
      </div>
    </ScrollArea>
  )
}

export type AppointmentsCalendarSkeletonProps = {
  mode: CalendarViewMode
  isMobile: boolean
  anchor?: Date
}

/** Picks the calendar skeleton that matches the active view and breakpoint. */
export function AppointmentsCalendarSkeleton({
  mode,
  isMobile,
  anchor,
}: AppointmentsCalendarSkeletonProps) {
  if (mode === "month") {
    return <AppointmentsMonthSkeleton anchor={anchor} />
  }

  if (isMobile) {
    return <AppointmentsMobileListSkeleton mode={mode} />
  }

  return <AppointmentsTimeGridSkeleton mode={mode} />
}

type AppointmentsPageSkeletonProps = {
  mode?: CalendarViewMode
  isMobile?: boolean
  anchor?: Date
}

/** Full-page silhouette matching AppointmentsPanel. */
export function AppointmentsPageSkeleton({
  mode = "month",
  isMobile = false,
  anchor,
}: AppointmentsPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Carregando agendamentos"
      className="flex flex-col gap-6"
    >
      <PageHeaderSkeleton
        titleClassName="h-7 w-40"
        descriptionClassName="h-4 w-80 max-w-full"
        actionClassName="h-9 w-44"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>

      <AppointmentsCalendarSkeleton
        mode={mode}
        isMobile={isMobile}
        anchor={anchor}
      />
    </div>
  )
}
