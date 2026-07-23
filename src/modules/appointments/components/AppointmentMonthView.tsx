"use client"

import {
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
} from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { AppointmentEventCard } from "@/modules/appointments/components/AppointmentEventCard"
import { getVisibleRange } from "@/modules/appointments/utils/calendar-range"
import type { Appointment } from "@/modules/appointments/types/appointment"

const MAX_CHIPS_PER_DAY = 3

type AppointmentMonthViewProps = {
  anchor: Date
  appointments: Appointment[]
  onSelectDay: (date: Date) => void
  onSelectAppointment: (appointment: Appointment) => void
}

export function AppointmentMonthView({
  anchor,
  appointments,
  onSelectDay,
  onSelectAppointment,
}: AppointmentMonthViewProps) {
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
        {days.map((day) => {
          const dayAppointments = appointments
            .filter((appointment) => isSameDay(appointment.startsAt, day))
            .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
          const overflowCount = dayAppointments.length - MAX_CHIPS_PER_DAY
          const isCurrentMonth = isSameMonth(day, startOfMonth(anchor))

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex min-h-20 flex-col gap-0.5 bg-background p-1 sm:min-h-28 sm:p-1.5",
                !isCurrentMonth && "bg-muted/40",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center self-end rounded-full text-[0.7rem] font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:text-xs",
                  !isCurrentMonth && "text-muted-foreground",
                  isToday(day) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </button>

              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {dayAppointments.slice(0, MAX_CHIPS_PER_DAY).map((appointment) => (
                  <AppointmentEventCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="chip"
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelectAppointment(appointment)
                    }}
                  />
                ))}

                {overflowCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => onSelectDay(day)}
                    className="truncate px-1.5 text-left text-[0.65rem] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:underline"
                  >
                    +{overflowCount} mais
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
