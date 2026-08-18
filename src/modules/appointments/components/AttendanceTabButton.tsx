"use client"

import type { Icon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

type AttendanceTabButtonProps = {
  icon: Icon
  label: string
  active?: boolean
  disabled?: boolean
  tooltip?: string
  onClick: () => void
}

export function AttendanceTabButton({
  icon: Icon,
  label,
  active = false,
  disabled,
  tooltip,
  onClick,
}: AttendanceTabButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={tooltip}
      aria-label={label}
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium",
        "disabled:pointer-events-none disabled:opacity-50",
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon
        className="size-5"
        weight={active ? "fill" : "regular"}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </button>
  )
}
