import {
  BuildingsIcon,
  CalendarBlankIcon,
  DotsThreeOutlineIcon,
  HouseIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import {
  MOCK_CLINIC_NAME,
  MOCK_NAV_ITEMS,
  MOCK_OVERFLOW_LABEL,
  MOCK_ROLE_LABEL,
  MOCK_USER_INITIALS,
  type MockNavLabel,
} from "@/modules/marketing/constants/mock-data"

const NAV_ICONS = {
  Início: HouseIcon,
  Agendamentos: CalendarBlankIcon,
  Pacientes: UsersIcon,
} as const

type MockAppChromeProps = {
  children: ReactNode
  /** Highlighted nav label (matches MOCK_NAV_ITEMS or Faturamento via Mais). */
  activeNav?: MockNavLabel
  className?: string
  /** Compact chrome for denser showcase frames. */
  compact?: boolean
}

export function MockAppChrome({
  children,
  activeNav = "Agendamentos",
  className,
  compact = false,
}: MockAppChromeProps) {
  const overflowActive = activeNav === "Faturamento"

  return (
    <div
      aria-hidden="true"
      inert
      className={cn(
        "pointer-events-none flex flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-[0_24px_64px_-28px_color-mix(in_oklch,var(--foreground)_28%,transparent),0_0_0_1px_color-mix(in_oklch,var(--border)_80%,transparent)]",
        className,
      )}
    >
      <header className="shrink-0 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div
          className={cn(
            "flex items-center gap-2",
            compact ? "h-11 px-2.5" : "h-12 px-3",
          )}
        >
          <div className="flex min-w-0 max-w-40 items-center gap-2 sm:max-w-48">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BuildingsIcon className="size-3.5" weight="bold" />
            </span>
            <span className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-xs font-medium sm:text-sm">
                {MOCK_CLINIC_NAME}
              </span>
              <span className="hidden truncate text-[0.65rem] text-muted-foreground sm:block">
                {MOCK_ROLE_LABEL}
              </span>
            </span>
          </div>

          <span
            className="hidden h-5 w-px shrink-0 bg-border/80 sm:block"
            aria-hidden="true"
          />

          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 sm:flex">
            {MOCK_NAV_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.label]
              const isActive = item.label === activeNav
              return (
                <span
                  key={item.id}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
              )
            })}
            <span
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium",
                overflowActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
              )}
            >
              <DotsThreeOutlineIcon className="size-3.5" weight="bold" />
              <span>{MOCK_OVERFLOW_LABEL}</span>
            </span>
          </nav>

          <span className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.6rem] font-medium text-foreground">
            {MOCK_USER_INITIALS}
          </span>
        </div>
      </header>

      <div
        className={cn(
          "min-w-0 flex-1 dark:bg-app-wash",
          compact ? "p-2.5" : "p-3 sm:p-4",
        )}
      >
        {children}
      </div>
    </div>
  )
}
