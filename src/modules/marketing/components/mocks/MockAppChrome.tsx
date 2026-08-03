import {
  CalendarBlankIcon,
  CurrencyCircleDollarIcon,
  HouseIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import {
  MOCK_CLINIC_NAME,
  MOCK_NAV_ITEMS,
} from "@/modules/marketing/constants/mock-data"

const NAV_ICONS = [
  HouseIcon,
  UsersIcon,
  CalendarBlankIcon,
  CurrencyCircleDollarIcon,
] as const

type MockAppChromeProps = {
  children: ReactNode
  /** Highlighted nav label (matches MOCK_NAV_ITEMS). */
  activeNav?: string
  toolbar?: ReactNode
  className?: string
  /** Compact chrome for denser showcase frames. */
  compact?: boolean
}

export function MockAppChrome({
  children,
  activeNav = "Agenda",
  toolbar,
  className,
  compact = false,
}: MockAppChromeProps) {
  return (
    <div
      aria-hidden="true"
      inert
      className={cn(
        "pointer-events-none flex overflow-hidden rounded-xl border border-border/80 bg-background shadow-[0_24px_64px_-28px_color-mix(in_oklch,var(--foreground)_28%,transparent),0_0_0_1px_color-mix(in_oklch,var(--border)_80%,transparent)]",
        className,
      )}>
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground sm:flex",
          compact ? "w-44" : "w-52",
        )}>
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-3 py-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-[0.65rem] font-semibold text-sidebar-primary-foreground">
            CH
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{MOCK_CLINIC_NAME}</p>
            <p className="truncate text-[0.65rem] text-muted-foreground">
              Operação
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 p-2">
          <p className="px-2 py-1.5 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            Operação
          </p>
          {MOCK_NAV_ITEMS.map((item, index) => {
            const Icon = NAV_ICONS[index] ?? HouseIcon
            const isActive = item.label === activeNav
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                  isActive
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80",
                )}>
                <Icon className="size-3.5 shrink-0" weight="duotone" />
                <span>{item.label}</span>
              </div>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        {toolbar ? (
          <div className="flex items-center gap-2 border-b border-border/70 px-3 py-2.5 sm:px-4">
            {toolbar}
          </div>
        ) : null}
        <div className={cn("min-w-0 flex-1", compact ? "p-2.5" : "p-3 sm:p-4")}>
          {children}
        </div>
      </div>
    </div>
  )
}
