import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"
import {
  MOCK_AGENDA_EVENTS,
  MOCK_HOUR_MARKS,
  MOCK_WEEK_DAYS,
  mockEventColor,
} from "@/modules/marketing/constants/mock-data"

const HOUR_HEIGHT_PX = 48
const GRID_START_HOUR = 8

type MockWeekAgendaProps = {
  className?: string
}

export function MockWeekAgenda({ className }: MockWeekAgendaProps) {
  const gridHeight = MOCK_HOUR_MARKS.length * HOUR_HEIGHT_PX

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ButtonGroup>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              tabIndex={-1}
              aria-label="Período anterior"
            >
              <CaretLeftIcon />
            </Button>
            <Button type="button" variant="outline" size="sm" tabIndex={-1}>
              Hoje
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              tabIndex={-1}
              aria-label="Próximo período"
            >
              <CaretRightIcon />
            </Button>
          </ButtonGroup>
          <span className="font-heading text-sm font-medium capitalize text-foreground">
            21 – 25 jul 2026
          </span>
        </div>

        <ButtonGroup>
          <Button type="button" variant="outline" size="sm" tabIndex={-1}>
            Mês
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            tabIndex={-1}
            className="bg-accent text-accent-foreground"
          >
            Semana
          </Button>
          <Button type="button" variant="outline" size="sm" tabIndex={-1}>
            Dia
          </Button>
        </ButtonGroup>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[2.5rem_repeat(5,minmax(0,1fr))]">
          <div className="border-r border-border bg-background" />
          {MOCK_WEEK_DAYS.map((day) => (
            <div
              key={day.label}
              className="flex flex-col items-center gap-0.5 border-b border-r border-border bg-background py-1.5 last:border-r-0"
            >
              <span className="text-[0.6rem] font-medium text-muted-foreground uppercase">
                {day.label}
              </span>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  day.isToday
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground",
                )}
              >
                {day.day}
              </span>
            </div>
          ))}

          <div
            className="relative border-r border-border"
            style={{ height: gridHeight }}
          >
            {MOCK_HOUR_MARKS.map((hour, index) => (
              <span
                key={hour}
                className="absolute right-1 -translate-y-1/2 text-[0.6rem] text-muted-foreground"
                style={{ top: index * HOUR_HEIGHT_PX }}
              >
                {String(hour).padStart(2, "0")}h
              </span>
            ))}
          </div>

          {MOCK_WEEK_DAYS.map((day, dayIndex) => (
            <div
              key={`col-${day.label}`}
              className="relative border-r border-border last:border-r-0"
              style={{ height: gridHeight }}
            >
              {MOCK_HOUR_MARKS.map((_, index) => (
                <div
                  key={index}
                  className="absolute inset-x-0 border-b border-border/60"
                  style={{
                    top: index * HOUR_HEIGHT_PX,
                    height: HOUR_HEIGHT_PX,
                  }}
                />
              ))}

              {MOCK_AGENDA_EVENTS.filter((event) => event.day === dayIndex).map(
                (event) => {
                  const color = mockEventColor(event.colorIndex)
                  const top =
                    (event.startHour - GRID_START_HOUR) * HOUR_HEIGHT_PX
                  const height = Math.max(
                    event.durationHours * HOUR_HEIGHT_PX - 2,
                    28,
                  )

                  return (
                    <div
                      key={event.id}
                      className="absolute inset-x-0.5 z-10 flex flex-col overflow-hidden rounded-md border px-1.5 py-1 text-foreground shadow-sm dark:text-background"
                      style={{
                        top,
                        height,
                        color: `color-mix(in srgb, ${color} 25%, black)`,
                        backgroundColor: `color-mix(in srgb, ${color} 100%, transparent)`,
                        borderColor: `color-mix(in srgb, ${color} 100%, transparent)`,
                      }}
                    >
                      <span className="truncate text-[0.65rem] font-semibold leading-tight">
                        {event.patientName}
                      </span>
                      <span className="truncate text-[0.6rem] opacity-80">
                        {event.timeLabel}
                      </span>
                    </div>
                  )
                },
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
