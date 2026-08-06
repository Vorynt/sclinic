import {
  Card,
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
  accent?: HomeStatAccent
}

type HomeStatCardsProps = {
  items: HomeStatCard[]
}

const ACCENT_BAR: Record<HomeStatAccent, string> = {
  default: "bg-primary/40",
  info: "bg-primary",
  success: "bg-chart-2",
  warning: "bg-chart-1",
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
        return (
          <Card key={item.label} size="sm" className="relative overflow-hidden">
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-0 left-0 w-1 rounded-l-xl",
                ACCENT_BAR[accent]
              )}
            />
            <CardHeader className="pl-5">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle
                className={cn("text-2xl tabular-nums", ACCENT_VALUE[accent])}>
                {item.value ?? "—"}
              </CardTitle>
              {item.hint ? (
                <CardDescription>{item.hint}</CardDescription>
              ) : null}
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
