"use client";

import { startOfDay } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { AppointmentsPageSkeleton } from "@/modules/appointments/components/AppointmentsPageSkeleton";
import { isCalendarViewMode } from "@/modules/appointments/utils/agenda-href";
import type { CalendarViewMode } from "@/modules/appointments/utils/calendar-range";
import { parseISODate } from "@/utils/date";

function resolveRouteCalendarMode(
  rawMode: string | null,
  isMobile: boolean,
): CalendarViewMode {
  if (isCalendarViewMode(rawMode)) {
    return rawMode;
  }

  return isMobile ? "day" : "month";
}

/** Route-level skeleton that mirrors URL view mode and viewport. */
export function AppointmentsRouteSkeleton() {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const mode = useMemo(
    () => resolveRouteCalendarMode(searchParams.get("mode"), isMobile),
    [isMobile, searchParams],
  );

  const anchor = useMemo(() => {
    const dateParam = searchParams.get("date");
    if (!dateParam) {
      return startOfDay(new Date());
    }

    return parseISODate(dateParam) ?? startOfDay(new Date());
  }, [searchParams]);

  return (
    <AppointmentsPageSkeleton mode={mode} isMobile={isMobile} anchor={anchor} />
  );
}
