"use client"

import { format } from "date-fns"

import { cn } from "@/lib/utils"
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block"

type ScheduleBlockEventCardProps = {
  block: ScheduleBlock
  style?: React.CSSProperties
  className?: string
  onClick?: (event: React.MouseEvent) => void
}

export function ScheduleBlockEventCard({
  block,
  style,
  className,
  onClick,
}: ScheduleBlockEventCardProps) {
  const label = block.reason?.trim() || "Bloqueio"
  return (
    <button
      type="button"
      data-slot="schedule-block-event-card"
      onClick={onClick}
      style={style}
      aria-label={`${label} - ${format(block.startsAt, "HH:mm")} - ${format(block.endsAt, "HH:mm")}`}
      className={cn(
        "absolute flex flex-col rounded-md border border-dashed border-muted-foreground/50 bg-muted/80 px-1.5 py-1 text-left text-muted-foreground shadow-sm outline-none hover:z-20 hover:bg-muted focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="truncate text-xs font-semibold">{label}</span>
      <span className="truncate text-xs opacity-80">
        {format(block.startsAt, "HH:mm")}–{format(block.endsAt, "HH:mm")}
      </span>
      {block.professionalName ? (
        <span className="truncate text-xs opacity-70">
          {block.professionalName}
        </span>
      ) : null}
    </button>
  )
}
