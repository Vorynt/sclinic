import type { Icon } from "@phosphor-icons/react"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type HomeStatAccent = "default" | "info" | "success" | "warning"

export type HomeStatCard = {
  label: string
  value?: string
  hint?: string
  icon: Icon
  accent?: HomeStatAccent
}

type HomeStatCardsProps = {
  items: HomeStatCard[]
}

const ACCENT_ICON: Record<HomeStatAccent, string> = {
  default: "bg-muted text-muted-foreground",
  info: "bg-primary/10 text-primary",
  success: "bg-chart-2/15 text-chart-4 dark:text-chart-2",
  warning: "bg-chart-1/15 text-chart-3",
}

const ACCENT_VALUE: Record<HomeStatAccent, string> = {
  default: "text-foreground",
  info: "text-primary",
  success: "text-chart-4 dark:text-chart-2",
  warning: "text-chart-3",
}

export function HomeStatCards({ items }: HomeStatCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const accent = item.accent ?? "default"
        const Icon = item.icon
        return (
          <Card key={item.label} size="sm">
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle
                className={cn("text-2xl tabular-nums", ACCENT_VALUE[accent])}>
                {item.value ?? "—"}
              </CardTitle>
              {item.hint ? (
                <CardDescription>{item.hint}</CardDescription>
              ) : null}
              <CardAction>
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg",
                    ACCENT_ICON[accent]
                  )}>
                  <Icon className="size-5" weight="duotone" />
                </span>
              </CardAction>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
