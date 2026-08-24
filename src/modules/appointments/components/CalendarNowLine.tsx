"use client"

import { useEffect, useState } from "react"
import { isToday } from "date-fns"

import type { CalendarHourRange } from "@/modules/appointments/utils/calendar-clinic-hours"

type CalendarNowLineProps = {
  day: Date
  hourRange: CalendarHourRange
  hourHeightPx: number
}

export function CalendarNowLine({
  day,
  hourRange,
  hourHeightPx,
}: CalendarNowLineProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date())
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  if (!isToday(day)) return null

  const minutesFromRangeStart =
    now.getHours() * 60 + now.getMinutes() - hourRange.start * 60
  const totalMinutes = (hourRange.end - hourRange.start) * 60
  if (minutesFromRangeStart < 0 || minutesFromRangeStart > totalMinutes) {
    return null
  }

  const topPx = (minutesFromRangeStart / 60) * hourHeightPx

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-3 flex items-center"
      style={{ top: topPx }}>
      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
      <span className="h-px flex-1 bg-primary" />
    </div>
  )
}
