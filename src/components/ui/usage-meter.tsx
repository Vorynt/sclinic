import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type UsageMeterStatus = "ok" | "at_capacity" | "over_limit"

export type UsageMeterProps = {
  /** Resource name shown as the primary label. */
  label: string
  /** Optional supporting text under the label. */
  description?: string
  /** Current consumption. */
  used: number
  /** Plan ceiling; `null` means unlimited. */
  limit: number | null
  /** Formats used/limit numbers (defaults to locale string). */
  formatValue?: (value: number) => string
  /** Visual state derived by the caller from usage vs limit. */
  status?: UsageMeterStatus
  className?: string
}

const STATUS_LABELS: Record<UsageMeterStatus, string | null> = {
  ok: null,
  at_capacity: "No limite",
  over_limit: "Acima do limite",
}

function defaultFormat(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

function usagePercent(used: number, limit: number | null): number {
  if (limit == null || limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

/**
 * Generic meter for quota-style resources (used vs limit + progress).
 */
export function UsageMeter({
  label,
  description,
  used,
  limit,
  formatValue = defaultFormat,
  status = "ok",
  className,
}: UsageMeterProps) {
  const percent = usagePercent(used, limit)
  const statusLabel = STATUS_LABELS[status]
  const usedLabel = formatValue(used)
  const limitLabel = limit == null ? "Ilimitado" : formatValue(limit)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{label}</p>
            {statusLabel ? (
              <Badge
                variant={status === "over_limit" ? "destructive" : "outline"}
              >
                {statusLabel}
              </Badge>
            ) : null}
          </div>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
          <span
            className={cn(
              "font-medium text-foreground",
              status === "over_limit" && "text-destructive",
            )}
          >
            {usedLabel}
          </span>
          {" / "}
          {limitLabel}
        </p>
      </div>

      <Progress
        value={limit == null ? 0 : percent}
        aria-label={`${label}: ${usedLabel} de ${limitLabel}`}
        className={cn(
          "h-2",
          status === "over_limit" &&
            "**:data-[slot=progress-indicator]:bg-destructive",
        )}
      />
    </div>
  )
}
